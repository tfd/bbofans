/* jshint -W030 */
var mongoose = require('../load-mongoose');
var model = require('../../src/models/tournament');
model.Member = require('../../src/models/member').Member;
var async = require('async');
var dbutils = require('../db-utils')(model);

describe('Member addTournament function', function () {

  after(function (done) {
    async.map(['Member', 'Tournament'], dbutils.clearTable, function (err) {
      done();
    });
  });

  beforeEach(function (done) {
    async.map(['Member', 'Tournament'], dbutils.clearTable, function (err) {
      var Members = [
        new model.Member({
          bboName: 'member1',
          name: '1',
          email: 'name@company.com',
          nation: 'Italy'
        })
      ];

      async.map(Members, function (Member, next) {
        Member.save(next);
      }, function (err) {
        done();
      });
    });
  });

  it('schould exist', function (done) {
    model.Member.findOne({bboName: 'member1'}, function (err, member) {
      expect(member.addTournament).to.be.a('Function');
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
            players: ['member1'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament) {
          callback(err, tournament);
        });
      },
      function(tournament, callback) {
        model.Member.findOne({bboName: 'member1'}, function (err, member) {
          callback(err, tournament, member);
        });
      },
      function(tournament, member, callback) {
        member.addTournament(tournament);
        callback(null, tournament, member);
      },
      function(tournament, member) {
        expect(member.playedInTournaments[0].toHexString()).to.equal(tournament.id);
        expect(member.totalScores.numTournaments).to.equal(1);
        expect(member.totalScores.averageScore).to.equal(50);
        expect(member.totalScores.averageMatchPoints).to.equal(10);
        expect(member.totalScores.awards).to.equal(1);
        expect(member.monthlyScores[0].year).to.equal(2014);
        expect(member.monthlyScores[0].month).to.equal(9);
        expect(member.monthlyScores[0].numTournaments).to.equal(1);
        expect(member.monthlyScores[0].averageScore).to.equal(50);
        expect(member.monthlyScores[0].averageMatchPoints).to.equal(10);
        expect(member.monthlyScores[0].awards).to.equal(1);
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
            players: ['member1'],
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
            players: ['member1'],
            score: 60,
            matchPoints: 14,
            awards: 2
          }]
        }).save(function (err, tournament2) {
          callback(err, tournament1, tournament2);
        });
      },
      function (tournament1, tournament2, callback) {
        model.Member.findOne({bboName: 'member1'}, function (err, member) {
          callback(err, member, tournament1, tournament2);
        });
      },
      function (member, tournament1, tournament2, callback) {
        member.addTournament(tournament1);
        member.addTournament(tournament2);
        callback(null, member, tournament1, tournament2);
      },
      function (member, tournament1, tournament2) {
        expect(member.playedInTournaments[0].toHexString()).to.equal(tournament1.id);
        expect(member.playedInTournaments[1].toHexString()).to.equal(tournament2.id);
        expect(member.totalScores.numTournaments).to.equal(2);
        expect(member.totalScores.averageScore).to.equal(55);
        expect(member.totalScores.averageMatchPoints).to.equal(12);
        expect(member.totalScores.awards).to.equal(3);
        expect(member.monthlyScores[0].year).to.equal(2014);
        expect(member.monthlyScores[0].month).to.equal(9);
        expect(member.monthlyScores[0].numTournaments).to.equal(1);
        expect(member.monthlyScores[0].averageScore).to.equal(50);
        expect(member.monthlyScores[0].averageMatchPoints).to.equal(10);
        expect(member.monthlyScores[0].awards).to.equal(1);
        expect(member.monthlyScores[1].year).to.equal(2014);
        expect(member.monthlyScores[1].month).to.equal(8);
        expect(member.monthlyScores[1].numTournaments).to.equal(1);
        expect(member.monthlyScores[1].averageScore).to.equal(60);
        expect(member.monthlyScores[1].averageMatchPoints).to.equal(14);
        expect(member.monthlyScores[1].awards).to.equal(2);

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
            players: ['member1'],
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
            players: ['member1'],
            score: 60,
            matchPoints: 14,
            awards: 2
          }]
        }).save(function (err, tournament2) {
          callback(err, tournament1, tournament2);
        });
      },
      function (tournament1, tournament2, callback) {
        model.Member.findOne({bboName: 'member1'}, function (err, member) {
          callback(err, member, tournament1, tournament2);
        });
      },
      function (member, tournament1, tournament2, callback) {
        member.addTournament(tournament1);
        member.addTournament(tournament2);
        callback(null, member, tournament1, tournament2);
      },
      function (member, tournament1, tournament2) {
        expect(member.playedInTournaments[0].toHexString()).to.equal(tournament1.id);
        expect(member.playedInTournaments[1].toHexString()).to.equal(tournament2.id);
        expect(member.totalScores.numTournaments).to.equal(2);
        expect(member.totalScores.averageScore).to.equal(55);
        expect(member.totalScores.averageMatchPoints).to.equal(12);
        expect(member.totalScores.awards).to.equal(3);
        expect(member.monthlyScores[0].year).to.equal(2014);
        expect(member.monthlyScores[0].month).to.equal(9);
        expect(member.monthlyScores[0].numTournaments).to.equal(2);
        expect(member.monthlyScores[0].averageScore).to.equal(55);
        expect(member.monthlyScores[0].averageMatchPoints).to.equal(12);
        expect(member.monthlyScores[0].awards).to.equal(3);

        done();
      }
    ]);
  });

  it('should throw an error if member didn\'t play in the tournament', function (done) {
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
        model.Member.findOne({bboName: 'member1'}, function (err, member) {
          callback(err, tournament, member);
        });
      },
      function(tournament, member, callback) {
        expect(function () { member.addTournament(tournament); }).to.throw();
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
            players: ['member1'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament) {
          callback(err, tournament);
        });
      },
      function (tournament, callback) {
        model.Member.findOne({bboName: 'member1'}, function (err, member) {
          callback(err, member, tournament);
        });
      },
      function (member, tournament) {
        member.addTournament(tournament);
        expect(function () {member.addTournament(tournament);}).to.throw();
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
            players: ['member1'],
            score: 50,
            matchPoints: 10,
            awards: 1
          }]
        }).save(function (err, tournament) {
          callback(err, tournament);
        });
      },
      function(tournament, callback) {
        model.Member.findOne({bboName: 'member1'}, function (err, member) {
          callback(err, tournament, member);
        });
      },
      function(tournament, member, callback) {
        member.addTournament(tournament);
        model.Member.findOne({bboName: 'member1'}, function (err, member) {
          callback(err, tournament, member);
        });
      },
      function(tournament, member) {
        expect(member.playedInTournaments).to.have.length(0);
        expect(member.totalScores.numTournaments).to.equal(0);
        expect(member.totalScores.averageScore).to.equal(0);
        expect(member.totalScores.averageMatchPoints).to.equal(0);
        expect(member.totalScores.awards).to.equal(0);
        expect(member.monthlyScores).to.have.length(0);

        done();
      }
    ]);
  });

});
