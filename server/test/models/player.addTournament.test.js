/* jshint -W030 */
var mongoose = require('../load-mongoose');
var model = require('../../src/models/tournament');
model.Player = require('../../src/models/player').Player;
var async = require('async');
var dbutils = require('../db-utils')(model);

describe('Player addTournament function', function () {

  after(function (done) {
    async.map(['Player', 'Tournament'], dbutils.clearTable, function (err) {
      done();
    });
  });

  beforeEach(function (done) {
    async.map(['Player', 'Tournament'], dbutils.clearTable, function (err) {
      var players = [
        new model.Player({
          bboName: 'player1',
          name: '1',
          email: 'name@company.com',
          nation: 'Italy'
        })
      ];

      async.map(players, function (player, next) {
        player.save(next);
      }, function (err) {
        done();
      });
    });
  });

  it('schould exist', function (done) {
    model.Player.findOne({bboName: 'player1'}, function (err, player) {
      expect(player.addTournament).to.be.a('Function');
      done();
    });
  });

  it('should update the scores', function (done) {
    async.waterfall([
      function(callback) {
        new model.Tournament({
          name: 'Tournament1',
          date: new Date(2014, 9, 26, 18, 0, 0, 0),
          numPlayers: 4,
          results: [{
            players: ['player1'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament) {
          callback(err, tournament);
        });
      },
      function(tournament, callback) {
        model.Player.findOne({bboName: 'player1'}, function (err, player) {
          callback(err, tournament, player);
        });
      },
      function(tournament, player, callback) {
        player.addTournament(tournament);
        callback(null, tournament, player);
      },
      function(tournament, player) {
        expect(player.playedInTournaments[0].toHexString()).to.equal(tournament.id);
        expect(player.totalScores.numTournaments).to.equal(1);
        expect(player.totalScores.averageScore).to.equal(50);
        expect(player.totalScores.averageMatchPoints).to.equal(10);
        expect(player.totalScores.awards).to.equal(1);
        expect(player.monthlyScores[0].year).to.equal(2014);
        expect(player.monthlyScores[0].month).to.equal(9);
        expect(player.monthlyScores[0].numTournaments).to.equal(1);
        expect(player.monthlyScores[0].averageScore).to.equal(50);
        expect(player.monthlyScores[0].averageMatchPoints).to.equal(10);
        expect(player.monthlyScores[0].awards).to.equal(1);
        done();
      }
    ]);
  });

  it('should add new monthly scores', function (done) {
    async.waterfall([
      function (callback) {
        new model.Tournament({
          name: 'Tournament1',
          date: new Date(2014, 9, 26, 18, 0, 0, 0),
          numPlayers: 4,
          results: [{
            players: ['player1'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament1) {
          callback(err, tournament1);
        });
      },
      function (tournament1, callback) {
        new model.Tournament({
          name: 'Tournament2',
          date: new Date(2014, 8, 26, 18, 0, 0, 0),
          numPlayers: 4,
          results: [{
            players: ['player1'],
            score: 60,
            matchPoints: 14,
            awards: 2
          }]
        }).save(function (err, tournament2) {
          callback(err, tournament1, tournament2);
        });
      },
      function (tournament1, tournament2, callback) {
        model.Player.findOne({bboName: 'player1'}, function (err, player) {
          callback(err, player, tournament1, tournament2);
        });
      },
      function (player, tournament1, tournament2, callback) {
        player.addTournament(tournament1);
        player.addTournament(tournament2);
        callback(null, player, tournament1, tournament2);
      },
      function (player, tournament1, tournament2) {
        expect(player.playedInTournaments[0].toHexString()).to.equal(tournament1.id);
        expect(player.playedInTournaments[1].toHexString()).to.equal(tournament2.id);
        expect(player.totalScores.numTournaments).to.equal(2);
        expect(player.totalScores.averageScore).to.equal(55);
        expect(player.totalScores.averageMatchPoints).to.equal(12);
        expect(player.totalScores.awards).to.equal(3);
        expect(player.monthlyScores[0].year).to.equal(2014);
        expect(player.monthlyScores[0].month).to.equal(9);
        expect(player.monthlyScores[0].numTournaments).to.equal(1);
        expect(player.monthlyScores[0].averageScore).to.equal(50);
        expect(player.monthlyScores[0].averageMatchPoints).to.equal(10);
        expect(player.monthlyScores[0].awards).to.equal(1);
        expect(player.monthlyScores[1].year).to.equal(2014);
        expect(player.monthlyScores[1].month).to.equal(8);
        expect(player.monthlyScores[1].numTournaments).to.equal(1);
        expect(player.monthlyScores[1].averageScore).to.equal(60);
        expect(player.monthlyScores[1].averageMatchPoints).to.equal(14);
        expect(player.monthlyScores[1].awards).to.equal(2);

        done();
      }
    ]);
  });

  it('should merge monthly scores', function (done) {
    async.waterfall([
      function (callback) {
        new model.Tournament({
          name: 'Tournament1',
          date: new Date(2014, 9, 26, 18, 0, 0, 0),
          numPlayers: 4,
          results: [{
            players: ['player1'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament1) {
          callback(err, tournament1);
        });
      },
      function (tournament1, callback) {
        new model.Tournament({
          name: 'Tournament2',
          date: new Date(2014, 9, 15, 18, 0, 0, 0),
          numPlayers: 4,
          results: [{
            players: ['player1'],
            score: 60,
            matchPoints: 14,
            awards: 2
          }]
        }).save(function (err, tournament2) {
          callback(err, tournament1, tournament2);
        });
      },
      function (tournament1, tournament2, callback) {
        model.Player.findOne({bboName: 'player1'}, function (err, player) {
          callback(err, player, tournament1, tournament2);
        });
      },
      function (player, tournament1, tournament2, callback) {
        player.addTournament(tournament1);
        player.addTournament(tournament2);
        callback(null, player, tournament1, tournament2);
      },
      function (player, tournament1, tournament2) {
        expect(player.playedInTournaments[0].toHexString()).to.equal(tournament1.id);
        expect(player.playedInTournaments[1].toHexString()).to.equal(tournament2.id);
        expect(player.totalScores.numTournaments).to.equal(2);
        expect(player.totalScores.averageScore).to.equal(55);
        expect(player.totalScores.averageMatchPoints).to.equal(12);
        expect(player.totalScores.awards).to.equal(3);
        expect(player.monthlyScores[0].year).to.equal(2014);
        expect(player.monthlyScores[0].month).to.equal(9);
        expect(player.monthlyScores[0].numTournaments).to.equal(2);
        expect(player.monthlyScores[0].averageScore).to.equal(55);
        expect(player.monthlyScores[0].averageMatchPoints).to.equal(12);
        expect(player.monthlyScores[0].awards).to.equal(3);

        done();
      }
    ]);
  });

  it('should throw an error if player didn\'t play in the tournament', function (done) {
    async.waterfall([
      function(callback) {
        new model.Tournament({
          name: 'Tournament1',
          date: new Date(2014, 9, 26, 18, 0, 0, 0),
          numPlayers: 4,
          results: [{
            players: ['other'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament) {
          callback(err, tournament);
        });
      },
      function(tournament, callback) {
        model.Player.findOne({bboName: 'player1'}, function (err, player) {
          callback(err, tournament, player);
        });
      },
      function(tournament, player, callback) {
        expect(function () { player.addTournament(tournament); }).to.throw();
        done();
      }
    ]);
  });

  it('should throw an error when same tournament is added twice', function (done) {
    async.waterfall([
      function (callback) {
        new model.Tournament({
          name: 'Tournament',
          date: new Date(2014, 9, 26, 18, 0, 0, 0),
          numPlayers: 4,
          results: [{
            players: ['player1'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament) {
          callback(err, tournament);
        });
      },
      function (tournament, callback) {
        model.Player.findOne({bboName: 'player1'}, function (err, player) {
          callback(err, player, tournament);
        });
      },
      function (player, tournament) {
        player.addTournament(tournament);
        expect(function () {player.addTournament(tournament);}).to.throw();
        done();
      }
    ]);
  });

  it('should not save the data in the database', function (done) {
    async.waterfall([
      function(callback) {
        new model.Tournament({
          name: 'Tournament1',
          date: new Date(2014, 9, 26, 18, 0, 0, 0),
          numPlayers: 4,
          results: [{
            players: ['player1'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament) {
          callback(err, tournament);
        });
      },
      function(tournament, callback) {
        model.Player.findOne({bboName: 'player1'}, function (err, player) {
          callback(err, tournament, player);
        });
      },
      function(tournament, player, callback) {
        player.addTournament(tournament);
        model.Player.findOne({bboName: 'player1'}, function (err, player) {
          callback(err, tournament, player);
        });
      },
      function(tournament, player) {
        expect(player.playedInTournaments).to.have.length(0);
        expect(player.totalScores.numTournaments).to.equal(0);
        expect(player.totalScores.averageScore).to.equal(0);
        expect(player.totalScores.averageMatchPoints).to.equal(0);
        expect(player.totalScores.awards).to.equal(0);
        expect(player.monthlyScores).to.have.length(0);

        done();
      }
    ]);
  });

});
