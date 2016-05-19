/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var Tournament = mongoose.model('Tournament');
var http = require('http');
var url = require('url');
var parser = require('libxml-to-js');
var tidy = require('htmltidy').tidy;
var async = require('async');
var awards = require('../models/awards');
var httpUtils = require('../utils/httpUtils');
var _ = require('underscore');
var moment = require('moment');
var logger = require('../utils/logger');

/**
 * Controller for updating tournament scores.
 *
 * @class UpdateController
 * @constructor
 */

module.exports = function (config) {

  /**
   * Tournament information as read from the web page.
   *
   * @typedef {Object} TournamentLink
   * @property {String} name - name of the tournament.
   * @property {Date} date - date on which the tournament was played.
   * @property {String} resultsUrl - URL where to retrieve the leader board.
   * @property {String} boardsUrl - URL where to retrieve the games played.
   */

  /**
   * Results of 1 player or a pair in a tournament.
   *
   * @typedef {Object} TournamentResult
   * @property {String[]} players - players thar got this score
   * @property {Number} score - score, either match points or IMPs.
   * @property {Number} awards - award points given to these players.
   */

  /**
   * @callback GenericCallback
   * @param {Any} error - error object or null if no error occurred
   * @param {Any} result - result of the operation
   */


  /**
   * Download file at given url.
   *
   * The download is done with a HTTP POST request with a parameter offset=<current timezone>.
   *
   * @param {String} address - URL to download the content from
   * @param {GenericCallback} cb - function called with the downloaded content as result.
   */
  function download(address, cb) {
    logger.info("download " + address);

    // var now = new Date();
    // var offset = 'offset=' + now.getTimezoneOffset().toString();
    var parsedUrl = url.parse(address);
    var options = {
      hostname: parsedUrl.hostname,
      port    : parsedUrl.port || 80,
      path    : parsedUrl.path,
      method  : 'GET',
      headers : {
        // 'Content-Type'  : 'application/x-www-form-urlencoded',
        // 'Content-Length': Buffer.byteLength(offset),
        'User-Agent'    : 'bbo-fans/robot/1.0'
      }
    };

    var request = http.request(options);

    request.on('response', httpUtils.handleHttpResponse(function (response) {
      cb(null, response);
    }));
    request.on('error', function (e) {
      cb(e, null);
    });

    // request.write(offset);
    request.end();
  }

  /**
   * Download the list of tournaments.
   *
   * @param {GenericCallback} cb - function called with the downloaded html as result.
   */
  function downloadTournamentList(cb) {
    download(config.bbo.tournamentListUrl, cb);
  }

  /**
   * Tidy the HTML.
   *
   * Will transform the given html in a well-formed XML document.
   *
   * @param {String} html - the html to clean up.
   * @param {GenericCallback} cb - function called with the XML as result. -
   */
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

  /**
   * Get links from tournament list html
   *
   * @param {String} html - the html
   * @param {Function} cb - function called with an array of {@link TournamentLink}s as result.
   */
  function getLinks(html, cb) {
    logger.info("getLinks");

    //<a class="ldr" target="_new2" title="#1869 Free Bingo Race" href="tview.php?t=1869-1419877321">#1869 Free Bingo
    // Race</a>
    tidyHtml(html, function (err, xml) {
      if (err) { return cb(err, null); }
      parser(xml, '//tr[td/a[@class="ldr"]]', function (err, tr) {
        if (err) {
          return cb(err, null);
        }

        logger.info("getLinks found " + tr.length + " rows");

        var links = [];
        _.each(tr, function (row) {
          var date = moment().year().toString() + ' ' + row.td[0]['#'].substring(4);
          links.push({
            date      : moment(date, 'YYYY MMM DD hh:mm A').toDate(),
            boardsUrl : row.td[5].a['@'].href.trim(),
            name      : row.td[6].a['@'].title.trim(),
            resultsUrl: config.bbo.tournamentUrlPrefix + row.td[6].a['@'].href.trim()
          });
        });
        cb(null, links);
      });
    });
  }

  /**
   * Extract tournament results from HTML.
   *
   * @param {String} html - html to analyze
   * @param {GenericCallback} cb - function called with an array of {@link TournamentResult} as result.
   */
  function getTournamentResults(html, cb) {
    logger.info("getTournamentResults");

    tidyHtml(html, function (err, xml) {
      if (err) { return cb(err, null); }
      parser(xml, '//div[@class="onesection"]/table[@class="sectiontable"]/tr[@class]', function (err, rows) {
        if (err) { cb(err, null); }

        logger.info("getTournamentResults found " + rows.length + " results");

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

  /**
   * Sort array of {@link TournamentResult} by score in descending order (highest score first)
   *
   * @param {TournamentResult[]} results - scores to sort
   * @param {GenericCallback} cb - function called with the sorted array as result.
   */
  function sortByScore(results, cb) {
    logger.info("sortByScore " + results.length + " results");

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

  /**
   * Initialize a tournament record.
   *
   * @function setTournamentType
   * @param {TournamentResult[]} results - results of the tournament sorted by score.
   * @param {GenericCallback} cb - function called with the tournament as result.
   */

  /**
   * Create a {@link setTournamentType} function that will initialize tournament record.
   *
   * @param {TournamentLink} link - tournament data extracted from the html page
   * @returns {setTournamentType}
   */
  function createSetTournamentTypeFunction(link) {
    logger.info("createSetTournamentTypeFunction", link);

    return function (results, cb) {
      var tournament = {
        name      : link.name,
        date      : link.date,
        boardsUrl : link.boardsUrl,
        resultsUrl: link.resultsUrl,
        numPlayers: 0,
        isPairs   : false,
        isRbd     : false,
        results   : results
      };

      if (results.length > 0) {
        // It's a pairs tournament when there are 2 players per result.
        tournament.isPairs = results[0].players.length > 1;

        // Number of players is the number of results in the score table, eventually doubled if it's a pairs tournament.
        var numPlayers = results.length;
        if (tournament.isPairs) { numPlayers *= 2; }
        tournament.numPlayers = numPlayers;

        // RBD tournaments use IMPs score which have a median of 0, so the last score is always < 0.
        // Rock tournaments use match points which are in percentage, so they are always > 0.
        // Another way could be to test on 'ROCK's best DANCERS' in the title.
        tournament.isRbd = results[results.length - 1].score < 0;
      }

      cb(null, tournament);
    };
  }

  /**
   * Calculate award points for the players in a tournament.
   *
   * @param {Object} tournament
   * @param {GenericCallback} cb - function called with the tournament filled with awards as result.
   */
  function calculateAwards(tournament, cb) {
    logger.info("calculateAwards", tournament);

    if (tournament.numPlayers > 0) {
      var system = awards.getSystem(tournament.isRbd ? 'rbd' : 'rock', tournament.numPlayers);
      var prevScore = false;
      var currentPos = 0;

      tournament.results.forEach(function (result, pos) {
        if (prevScore === false || prevScore !== result.score) {
          prevScore = result.score;
          currentPos = pos;
        }
        result.awards = awards.getAwardPoints(system, currentPos);
      });
    }

    cb(null, tournament);
  }

  /**
   * Create a tournament record complete with award points.
   *
   * @param {TournamentLink} link - info about the tournament extracted from the html page.
   * @param {GenericCallback} cb - function called with the tournament record as result.
   */
  function createTournament(link, cb) {
    logger.info("CreateTournament", link);

    var url = link.resultsUrl;

    async.waterfall([
      function (cb) {
        download(url, cb);
      },
      getTournamentResults,
      sortByScore,
      createSetTournamentTypeFunction(link),
      calculateAwards
    ], function (err, tournament) {
      if (err) {
        logger.error('Error in createTournament', link, err);
        // Ignore error, so other tournaments will be handled anyway.
      }

      cb(null, tournament);
    });
  }

  /**
   * Check if a tournament has to be processed.
   *
   * @param {TournamentLink} link - information about the tournament
   * @param {GenericCallback} cb - function called with a value of true for the result if the tournament is to be added,
   *                               false otherwise.
   */
  function isTournamentToBeAdded(link, cb) {
    logger.info("isTournamentToBeAdded", link);
    
    Tournament.findOne({name: link.name, date: link.date}, function (err, t) {
      if (err) {
        logger.error('isTournamentToBeAdded', err);
      }

      logger.info("isTournamentToBeAdded for " + link.name + ": " + t.name + " at " + t.date);

      // Only download tournaments which don't exist.
      cb(t === null || t === undefined);
    });
  }

  /**
   * Create tournaments: download the results and create a tournament record.
   *
   * @param {TournamentLink[]} links - array of links to create tournaments for
   * @param {GenericCallback} cb - function called with an array of tournaments as result.
   */
  function createTournaments(links, cb) {
    logger.info("createTournaments " + links.length + " links");

    async.filter(links, isTournamentToBeAdded, function (newLinks) {
      // Ok add all tournaments that haven't already been processed.
      async.map(newLinks, createTournament, cb);
    });
  }

  return {

    /**
     * Update tournament results by downloading a list of tournaments from BBO and adding the results of the tournaments
     * to the players scores.
     *
     * @param req
     * @param res
     */
    update: function (req, res) {
      async.waterfall([
        downloadTournamentList,
        getLinks,
        createTournaments
      ], function (err, tournaments) {
        if (err) {
          logger.error('update', err);
          return res.status(500).json({error: err});
        }

        var numRbd = 0;
        var numRock = 0;
        var numPairs = 0;
        var numPlayers = 0;
        var numTournaments = tournaments.length;

        async.eachSeries(tournaments, function (tournament, cb) {
          if (!tournament) { return cb(); }

          if (tournament.isRbd) { numRbd++; }
          else { numRock++; }
          if (tournament.isPairs) { numPairs++; }
          numPlayers += tournament.numPlayers;
          Tournament.addTournament(tournament, function (err, t) {
            if (err) {
              logger.error('addTournament ' + tournament.name, err);
              // Ignore error, so other tournaments can still be added.
            }
            cb(null, t);
          });
        }, function (err) {
          if (err) { logger.error('updater.update', err); }

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
            logger.error('Unable to send response', e);
          }
        });
      });
    }

  };

};
