var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var http = require('http');
var url = require('url');
var parser = require('libxml-to-js');
var tidy = require('htmltidy').tidy;
var async = require('async');
var awards = require('../models/awards');
var tournamentsController = require('../controllers/tournaments');

function download (address, cb) {
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
  var data = [];

  var request = http.request(options);

  request.on('response', function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      data.push(chunk);
    });
    response.on('end', function () {
      if (cb) { cb(null, data.join('')); }
    });

  });
  request.on('error', function (e) {
    console.log('download', e);
    if (cb) { cb(e, null); }
  });

  request.write(offset);
  request.end();
}

function downloadTournamentList (cb) {
  download('http://webutil.bridgebase.com/v2/tarchive.php?m=h&h=bbo+fans', cb);
}

function tidyHtml (html, cb) {
  var opts = {
    'doctype'      : 'omit',
    'tidy-mark'    : false,
    'indent'       : false,
    'hide-comments': true,
    'output-xml'   : true
  };
  // Remove xmlns as it gives problems to the XPATH parser, to do this remove the DOCTYPE also.
  html = html.replace(/<html[^>]*>/g, '<html>').replace(/<!DOCTYPE[^>]*>/gi, '');
  tidy(html, opts, cb);
}

function getLinks (html, cb) {
  //<a class="ldr" target="_new2" title="#1869 Free Bingo Race" href="tview.php?t=1869-1419877321">#1869 Free Bingo
  // Race</a>
  tidyHtml(html, function (err, xml) {
    if (err) { return cb(err, null); }
    parser(xml, '//a[@class="ldr"]', cb);
  });
}

function getTournamentResults (html, cb) {
  tidyHtml(html, function (err, xml) {
    if (err) { return cb(err, null); }
    parser(xml, '//div[@class="onesection"]/table[@class="sectiontable"]/tr[@class]', function (err, rows) {
      if (err) { cb(err, null); }
      var results = [];
      rows.forEach(function (row) {
        results.push({
          players : row.td[0]['#'].split('+'),
          score: parseFloat(row.td[1].a['#'])
        });
      });
      cb(null, results);
    });
  });
}

function sortByScore (results, cb) {
  async.sortBy(results, function (result, cb) {
    cb(null, result.score);
  }, cb);
}

function setTournamentType (title) {
  return function (results, cb) {
    var tournament = {
      name: title,
      numPlayers: 0,
      isPairs: false,
      isRbd: false,
      results: results
    };

    var year = 20 + parseInt(title.substring(0, 2), 10);
    var month = parseInt(title.substring(2, 2), 10) - 1;
    var day = parseInt(title.substring(4, 2), 10);
    tournament.date = new Date(year, month, day);

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
  var title = link['@'].title;
  var url = 'http://webutil.bridgebase.com/v2/' + link['@'].href;

  async.waterfall([
    function (cb) {
      download(url, cb);
    },
    getTournamentResults,
    sortByScore,
    setTournamentType(title),
    calculateAwards
  ], cb);
}

function createTournaments (links, cb) {
  async.map(links, createTournament, cb);
}

var updater = {

  update: function (req, res) {
    async.waterfall([
      downloadTournamentList,
      getLinks,
      createTournaments
    ], function (err, tournaments) {
      if (err) {
        console.log('update', err);
        return res.json({error: err});
      }

      var numRbd = 0;
      var numRock = 0;
      var numPairs = 0;
      var numPlayers = 0;
      var numTournaments = tournaments.length;

      async.eachSeries(tournaments, function (tournament, cb) {
        if (tournament.isRbd) { numRbd++; }
        else { numRock++; }
        if (tournament.isPair) { numPairs++; }
        numPlayers += tournament.numPlayers;

        tournamentsController.addTournament(tournament, cb);
      }, function (err) {
        if (err) { console.error('updater.update', err); }

        res.json({
          numTournaments: numTournaments,
          numRock: numRock,
          numRbd: numRbd,
          numPairs: numPairs,
          numPlayers: numPlayers
        });
      });
    });
  }

};

module.exports = updater;
