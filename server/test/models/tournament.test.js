/* jshint -W030 */
var mongoose = require('../load-mongoose');
var Tournament = require('../../src/models/tournament');
var dbutils = require('../db-utils');
var async = require('async');

describe('Tournament Model', function () {

  after(function (done) {
    dbutils.clearTable(Tournament, done);
  });

  beforeEach(function (done) {
    dbutils.clearTable(Tournament, done);
  });

  it('should exist', function () {
    expect(Tournament).to.exist;
  });

  describe('create', function () {

    it('should have default values', function () {
      var tournament = new Tournament({
        name: 'Tournament',
        numPlayers: 4
      });

      expect(tournament.name).to.equal('Tournament');
      expect(tournament.date).to.be.a('Date');
      expect(tournament.numPlayers).to.equal(4);
      expect(tournament.isPair).to.equal(false);
      expect(tournament.isRbd).to.equal(false);
      expect(tournament.results).to.be.an('Array');
      expect(tournament.results).to.have.length(0);
      expect(tournament.createdAt).to.be.a('Date');
    });

    it('should save to the database', function (done) {
      async.waterfall([
        function (callback) {
          new Tournament({
            name: 'Tournament',
            numPlayers: 4
          }).save(function (err, tournament) {
            callback(err, tournament);
          });
        },
        function (tournament, callback) {
          Tournament.findOne({_id: tournament.id}, function (err, tournament) {
            callback(err, tournament);
          });
        },
        function (tournament, callback) {
          expect(tournament.name).to.equal('Tournament');
          expect(tournament.date).to.be.a('Date');
          expect(tournament.numPlayers).to.equal(4);
          expect(tournament.isPair).to.equal(false);
          expect(tournament.isRbd).to.equal(false);
          expect(tournament.results).to.be.an('Array');
          expect(tournament.results).to.have.length(0);
          expect(tournament.createdAt).to.be.a('Date');
          done();
        }
      ]);
    });

  });

  describe('validation', function () {

    it('should throw an error on duplicate name', function (done) {
      new Tournament({
        name: 'Tournament',
        numPlayers: 4
      }).save(function (err, tournament) {
        new Tournament({
          name: 'Tournament',
          numPlayers: 8
        }).save(function (err, tournament) {
          expect(err.message).to.equal('E11000 duplicate key error index: bbofans_test.tournaments.$name_1  dup key: { : "Tournament" }');
          done();
        });
      });
    });

    it('should throw an error on less than 4 players', function (done) {
      new Tournament({
        name: 'Tournament',
        numPlayers: 3
      }).save(function (err, tournament) {
        expect(err.errors.numPlayers.message).to.equal('Number of players must be at least 4');
        done();
      });
    });

  });

  describe('playedInTournament', function () {

    it('should recognize that player played in the tournament', function (done) {
      new Tournament({
        name: 'Tournament',
        numPlayers: 4,
        results: [{
          players: ['pippo']
        }]
      }).save(function (err, tournament) {
        expect(tournament.playedInTournament('pippo')).to.be.true;
        done();
      });
    });

    it('should recognize that player didn\'t play in the tournament', function (done) {
      new Tournament({
        name: 'Tournament',
        numPlayers: 4,
        results: [{
          players: ['pippo']
        }]
      }).save(function (err, tournament) {
        expect(tournament.playedInTournament('pluto')).to.be.false;
        done();
      });
    });

    it('should recognize that player played in the tournament at last resuts', function (done) {
      new Tournament({
        name: 'Tournament',
        numPlayers: 4,
        results: [{
          players: ['minnie', 'pluto']
        }, {
          players: ['ben', 'maria']
        }, {
          players: ['pluto', 'pippo']
        }]
      }).save(function (err, tournament) {
        expect(tournament.playedInTournament('pippo')).to.be.true;
        done();
      });
    });
  });

  describe('findPlayerScores', function () {

    it('should return scores for player', function (done) {
      new Tournament({
        name: 'Tournament',
        numPlayers: 4,
        results: [{
          players: ['minnie', 'pluto'],
          score: 55.0,
          matchPoints: 18.0,
          awards: 3
        }, {
          players: ['ben', 'maria'],
          score: 50.0,
          matchPoints: 16.0,
          awards: 2
        }, {
          players: ['pluto', 'pippo'],
          score: 45.0,
          matchPoints: 15.4,
          awards: 1
        }]
      }).save(function (err, tournament) {
        var scores = tournament.findPlayerScores('pippo');
        expect(scores.score).to.equal(45.0);
        expect(scores.matchPoints).to.equal(15.4);
        expect(scores.awards).to.equal(1);
        done();
      });
    });

    it('should return null scores for player that didn\'t play', function (done) {
      new Tournament({
        name: 'Tournament',
        numPlayers: 4,
        results: [{
          players: ['minnie', 'pippo'],
          score: 45.0,
          matchPoints: 15.4,
          awards: 1
        }]
      }).save(function (err, tournament) {
        var scores = tournament.findPlayerScores('pluto');
        expect(scores).to.be.null;
        done();      
      });
    });
  
  });

});
