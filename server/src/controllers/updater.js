/* jshint -W097 */
"use strict";

var env = process.env.NODE_ENV || 'dev';
var config = require('../../config/config')[env];
var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var Tournament = mongoose.model('Tournament');
var http = require('http');
var url = require('url');
var parser = require('libxml-to-js');
var tidy = require('htmltidy').tidy;
var async = require('async');
var awards = require('../models/awards');
var tournamentsController = require('../controllers/tournaments');
var httpUtils = require('../utils/httpUtils');
var _ = require('underscore');
var moment = require('moment');

module.exports = function () {

  function download(address, cb) {
    var now = new Date();
    var offset = 'offset=' + now.getTimezoneOffset().toString();
    var parsedUrl = url.parse(address);
    // var parsedUrl = url.parse('http://webutil.bridgebase.com/v2/tarchive.php?m=h&h=bbo+fans');
    var options = {
      hostname: parsedUrl.hostname,
      port    : parsedUrl.port || 80,
      path    : parsedUrl.path,
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(offset),
        'User-Agent'    : 'bbo-fans/robot/1.0'
      }
    };

    var request = http.request(options);

    request.on('response', httpUtils.handleHttpResponse(function (response) {
      cb(null, response);
    }));
    request.on('error', function (e) {
      console.log('download', e);
      cb(e, null);
    });

    request.write(offset);
    request.end();
  }

  function downloadTournamentList(cb) {
    download(config.bbo.tournamentListUrl, cb);
  }

  function tidyHtml(html, cb) {
    var opts = {
      'doctype'         : 'omit',
      'tidy-mark'       : false,
      'indent'          : false,
      'hide-comments'   : true,
      'output-xml'      : true,
      'numeric-entities': true
    };
    // Remove xmlns as it gives problems to the XPATH parser, to do this remove the DOCTYPE also.
    html = html.replace(/<html[^>]*>/g, '<html>').replace(/<!DOCTYPE[^>]*>/gi, '');
    tidy(html, opts, cb);
  }

  function getLinks(html, cb) {
    //<a class="ldr" target="_new2" title="#1869 Free Bingo Race" href="tview.php?t=1869-1419877321">#1869 Free Bingo
    // Race</a>
    tidyHtml(html, function (err, xml) {
      if (err) { return cb(err, null); }
      parser(xml, '//tr[td/a[@class="ldr"]]', function (err, tr) {
        if (err) {
          return cb(err, null);
        }

        var links = [];
        _.each(tr, function (row) {
          var date = moment().year().toString() + ' ' + row.td[0]['#'].substring(4);
          links.push({
            date: moment(date, 'YYYY MMM DD hh:mm A').toDate(),
            name: row.td[5].a['@'].title.trim(),
            href: row.td[5].a['@'].href.trim()
          });
        });
        cb(null, links);
      });
    });
  }

  function getTournamentResults(html, cb) {
    tidyHtml(html, function (err, xml) {
      if (err) { return cb(err, null); }
      parser(xml, '//div[@class="onesection"]/table[@class="sectiontable"]/tr[@class]', function (err, rows) {
        if (err) { cb(err, null); }
        var results = [];
        rows.forEach(function (row) {
          results.push({
            players: row.td[0]['#'].split('+'),
            score  : parseFloat(row.td[1].a['#'])
          });
        });
        cb(null, results);
      });
    });
  }

  function sortByScore(results, cb) {
    if (results[results.length - 1].score < 0) {
      // IMPs
      async.sortBy(results, function (result, cb) {
        cb(null, result.score * -1);
      }, cb);
    }
    else {
      // Match points
      async.sortBy(results, function (result, cb) {
        cb(null, 100 - result.score);
      }, cb);
    }
  }

  function setTournamentType(date, title) {
    return function (results, cb) {
      var tournament = {
        name      : title,
        date      : date,
        numPlayers: 0,
        isPairs   : false,
        isRbd     : false,
        results   : results
      };

      if (results.length > 0) {
        tournament.isPairs = results[0].players.length > 1;
        var numPlayers = results.length;
        if (tournament.isPairs) { numPlayers *= 2; }
        tournament.numPlayers = numPlayers;
        tournament.isRbd = results[results.length - 1].score < 0;
      }

      cb(null, tournament);
    };
  }

  function calculateAwards(tournament, cb) {
    if (tournament.numPlayers > 0) {
      var system = awards.getSystem(tournament.numPlayers);

      tournament.results.forEach(function (result, pos) {
        result.awards = awards.getAwardPoints(system, pos);
      });
    }

    cb(null, tournament);
  }

  function createTournament(link, cb) {
    var url = 'http://webutil.bridgebase.com/v2/' + link.href;

    async.waterfall([
      function (cb) {
        download(url, cb);
      },
      getTournamentResults,
      sortByScore,
      setTournamentType(link.date, link.name),
      calculateAwards
    ], function (err, tournament) {
      if (err) {
        console.error('Error in createTournament', link, err);
        // Ignore error, so other tournaments will be handled anyway.
      }

      cb (null, tournament);
    });
  }

  function checkIfTournamentAlreadyAdded(link, cb) {
    Tournament.findOne({name: link.name}, function (err, t) {
      if (err) {
        console.error('checkIfTournamentAlreadyAdded', err);
      }

      // Only download tournaments which don't exist.
      cb(t === null || t === undefined);
    });
  }

  function createTournaments(links, cb) {
    async.filter(links, checkIfTournamentAlreadyAdded, function (newLinks) {
      // Ok add all tournaments that haven't already been processed.
      async.map(newLinks, createTournament, cb);
    });
  }

  return {

    update: function (req, res) {
      async.waterfall([
        downloadTournamentList,
        getLinks,
        createTournaments
      ], function (err, tournaments) {
        if (err) {
          console.log('update', err);
          return res.status(500).json({error: err});
        }

        var numRbd = 0;
        var numRock = 0;
        var numPairs = 0;
        var numPlayers = 0;
        var numTournaments = tournaments.length;

        async.eachSeries(tournaments, function (tournament, cb) {
          if (! tournament) { return cb(); }

          if (tournament.isRbd) { numRbd++; }
          else { numRock++; }
          if (tournament.isPairs) { numPairs++; }
          numPlayers += tournament.numPlayers;
          Tournament.addTournament(tournament, function (err, t) {
            if (err) {
              console.error('addTournament ' + tournament.name, err);
              // Ignore error, so other tournaments can still be added.
            }
            cb (null, t);
          });
        }, function (err) {
          if (err) { console.error('updater.update', err); }

          try {
            res.json({
              numTournaments: numTournaments,
              numRock       : numRock,
              numRbd        : numRbd,
              numPairs      : numPairs,
              numPlayers    : numPlayers
            });
          }
          catch (e) {
            console.error('Unable to send response', e);
          }
        });
      });
    }

  };

};