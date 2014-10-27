var mongoose = require('../load-mongoose');
var model = require('../../../app/models/player');
var dbutils = require('../db-utils')(model);
var async = require('async');

describe('Player Model', function () {

  beforeEach(function (done) {
    dbutils.clearTable('Player', done);
  });

  after(function (done) {
    dbutils.clearTable('Player', done);
  });

  it('should exist', function () {
    expect(model.Player).to.exist;
  });

  describe('create', function () {
    it('should have defaults', function () {
      var player = new model.Player({
        bboName: 'bboname',
        name: 'name',
        email: 'pluto@minnie.com',
        nation: 'Italy'
      });

      expect(player.bboName).to.equal('bboname');
      expect(player.name).to.equal('name');
      expect(player.email).to.equal('pluto@minnie.com');
      expect(player.nation).to.equal('Italy');
      expect(player.level).to.equal('Beginner');
      expect(player.isStarPlayer).to.equal(false);
      expect(player.isBDPlayer).to.equal(false);
      expect(player.isEnabled).to.equal(false);
      expect(player.isBlackListed).to.equal(false);
      expect(player.isBanned).to.equal(false);
      expect(player.blackList).to.be.an('Array');
      expect(player.blackList).to.have.length(0);
      expect(player.playedInTournaments).to.be.an('Array');
      expect(player.playedInTournaments).to.have.length(0);
      expect(player.totalScores).to.be.an('Object');
      expect(player.totalScores.numTournaments).to.equal(0);
      expect(player.totalScores.averageScore).to.equal(0);
      expect(player.totalScores.averageMatchPoints).to.equal(0);
      expect(player.totalScores.awards).to.equal(0);
      expect(player.monthlyScores).to.be.an('Array');
      expect(player.monthlyScores).to.have.length(0);
      expect(player.validatedAt).to.be.undefined;
      expect(player.createdAt).to.be.a('Date');
    });

    it('should save to the database', function (done) {
      new model.Player({
        bboName: 'bboname',
        name: 'name',
        email: 'pluto@minnie.com',
        nation: 'Italy'
      }).save(function (err, p) {
        model.Player.findOne({bboName: 'bboname'}, function (err, p) {
          expect(err).to.be.null;
          expect(p).to.be.an('Object');
          expect(p.bboName).to.equal('bboname');
          expect(p.name).to.equal('name');
          expect(p.email).to.equal('pluto@minnie.com');
          expect(p.nation).to.equal('Italy');
          expect(p.level).to.equal('Beginner');
          expect(p.isStarPlayer).to.equal(false);
          expect(p.isBDPlayer).to.equal(false);
          expect(p.isEnabled).to.equal(false);
          expect(p.isBlackListed).to.equal(false);
          expect(p.isBanned).to.equal(false);
          expect(p.blackList).to.be.an('Array');
          expect(p.blackList).to.have.length(0);
          expect(p.playedInTournaments).to.be.an('Array');
          expect(p.playedInTournaments).to.have.length(0);
          expect(p.totalScores).to.be.an('Object');
          expect(p.totalScores.numTournaments).to.equal(0);
          expect(p.totalScores.averageScore).to.equal(0);
          expect(p.totalScores.averageMatchPoints).to.equal(0);
          expect(p.totalScores.awards).to.equal(0);
          expect(p.monthlyScores).to.be.an('Array');
          expect(p.monthlyScores).to.have.length(0);
          expect(p.validatedAt).to.be.undefined;
          expect(p.createdAt).to.be.a('Date');
          // expect(p.updatedAt).to.equal(p.createdAt);
          done();
        });
      });
    });
  });

  describe('validation', function () {
    it('should throw an error on empty BBO name', function (done) {
      new model.Player({
        bboName: '',
        name: 'name',
        email: 'pluto@minnie.com',
        nation: 'Italy'
      }).save(function (err, p) {
        expect(err.errors.bboName.message).to.equal('BBO name cannot be blank');
        done();
      });
    });

    it('should throw an error on empty name', function (done) {
      new model.Player({
        bboName: 'bboname',
        name: '',
        email: 'pluto@minnie.com',
        nation: 'Italy'
      }).save(function (err, p) {
        expect(err.errors.name.message).to.equal('Name cannot be blank');
        done();
      });
    });

    it('should throw an error on empty email', function (done) {
      new model.Player({
        bboName: 'bboname',
        name: 'name',
        email: '',
        nation: 'Italy'
      }).save(function (err, p) {
        expect(err.errors.email.message).to.equal('Email cannot be blank');
        done();
      });
    });

    it('should throw an error on empty nation', function (done) {
      new model.Player({
        bboName: 'bboname',
        name: 'name',
        email: 'pluto@minnie.com',
        nation: ''
      }).save(function (err, p) {
        expect(err.errors.nation.message).to.equal('Nation cannot be blank');
        done();
      });
    });

    it('should throw an error on multiple empty fields', function (done) {
      new model.Player({
        bboName: '',
        name: '',
        email: '',
        nation: ''
      }).save(function (err, p) {
        expect(err.errors.bboName.message).to.equal('BBO name cannot be blank');
        expect(err.errors.name.message).to.equal('Name cannot be blank');
        expect(err.errors.email.message).to.equal('Email cannot be blank');
        expect(err.errors.nation.message).to.equal('Nation cannot be blank');
        done();
      });
    });

    it('should throw an error on invalid email', function (done) {
      new model.Player({
        bboName: 'bboname',
        name: 'name',
        email: 'not_an_valid_email',
        nation: 'Italy'
      }).save(function (err, p) {
        expect(err.errors.email.message).to.equal('Email isn\'t a valid address');
        done();
      });
    });

    it('should throw an error on duplicate BBO name', function (done) {
      async.waterfall([
        function (callback) {
          new model.Player({
            bboName: 'bboname',
            name: 'name',
            email: 'pluto@minnie.com',
            nation: 'Italy'
          }).save(function (err, player) {
            callback(err, player);
          });
        },
        function (player, callback) {
          new model.Player({
            bboName: 'bboname',
            name: 'pippo',
            email: 'pippo@minnie.com',
            nation: 'Italy'
          }).save(function (err, player) {
            callback(null, err);
          });
        },
        function (err) {
          expect(err.message).to.equal('E11000 duplicate key error index: bbofans_test.players.$bboName_1  dup key: { : "bboname" }');
          done();
        }
      ]);
    });
  });
});
