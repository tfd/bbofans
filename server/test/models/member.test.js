/* jshint -W030 */
var mongoose = require('../load-mongoose');
var Member = require('../../src/models/member');
var dbutils = require('../db-utils');
var async = require('async');

describe('Member Model', function () {

  beforeEach(function (done) {
    dbutils.clearTable(Member, done);
  });

  after(function (done) {
    dbutils.clearTable(Member, done);
  });

  it('should exist', function () {
    expect(Member).to.exist;
  });

  describe('create', function () {
    it('should have defaults', function () {
      var member = new Member({
        bboName: 'bboname',
        name: 'name',
        email: 'pluto@minnie.com',
        nation: 'Italy'
      });

      expect(member.bboName).to.equal('bboname');
      expect(member.name).to.equal('name');
      expect(member.email).to.equal('pluto@minnie.com');
      expect(member.nation).to.equal('Italy');
      expect(member.level).to.equal('Beginner');
      expect(member.isStarPlayer).to.equal(false);
      expect(member.isRbdPlayer).to.equal(false);
      expect(member.isEnabled).to.equal(false);
      expect(member.isBlackListed).to.equal(false);
      expect(member.isBanned).to.equal(false);
      expect(member.rock.playedInTournaments).to.be.an('Array');
      expect(member.rock.playedInTournaments).to.have.length(0);
      expect(member.rock.totalScores).to.be.an('Object');
      expect(member.rock.totalScores.numTournaments).to.equal(0);
      expect(member.rock.totalScores.averageScore).to.equal(0);
      expect(member.rock.totalScores.averageMatchPoints).to.equal(0);
      expect(member.rock.totalScores.awards).to.equal(0);
      expect(member.rock.monthlyScores).to.be.an('Array');
      expect(member.rock.monthlyScores).to.have.length(0);
      expect(member.rbd.playedInTournaments).to.be.an('Array');
      expect(member.rbd.playedInTournaments).to.have.length(0);
      expect(member.rbd.totalScores).to.be.an('Object');
      expect(member.rbd.totalScores.numTournaments).to.equal(0);
      expect(member.rbd.totalScores.averageScore).to.equal(0);
      expect(member.rbd.totalScores.averageMatchPoints).to.equal(0);
      expect(member.rbd.totalScores.awards).to.equal(0);
      expect(member.rbd.monthlyScores).to.be.an('Array');
      expect(member.rbd.monthlyScores).to.have.length(0);
      expect(member.validatedAt).to.be.undefined;
      expect(member.registeredAt).to.be.undefined;
      expect(member.createdAt).to.be.a('Date');
    });

    it('should save to the database', function (done) {
      async.waterfall([
        function (callback) {
          new Member({
            bboName: 'bboname',
            name: 'name',
            email: 'pluto@minnie.com',
            nation: 'Italy'
          }).save(function (err, member) {
            callback(err);
          });
        },
        function (callback) {
          Member.findOne({ 'bboName': 'bboname' }, function (err, member) {
            callback(err, member);
          });
        },
        function (member) {
          expect(member).to.be.an('Object');
          expect(member.bboName).to.equal('bboname');
          expect(member.name).to.equal('name');
          expect(member.email).to.equal('pluto@minnie.com');
          expect(member.nation).to.equal('Italy');
          expect(member.level).to.equal('Beginner');
          expect(member.isStarPlayer).to.equal(false);
          expect(member.isRbdPlayer).to.equal(false);
          expect(member.isEnabled).to.equal(false);
          expect(member.isBlackListed).to.equal(false);
          expect(member.isBanned).to.equal(false);
          expect(member.rock.playedInTournaments).to.be.an('Array');
          expect(member.rock.playedInTournaments).to.have.length(0);
          expect(member.rock.totalScores).to.be.an('Object');
          expect(member.rock.totalScores.numTournaments).to.equal(0);
          expect(member.rock.totalScores.averageScore).to.equal(0);
          expect(member.rock.totalScores.averageMatchPoints).to.equal(0);
          expect(member.rock.totalScores.awards).to.equal(0);
          expect(member.rock.monthlyScores).to.be.an('Array');
          expect(member.rock.monthlyScores).to.have.length(0);
          expect(member.rbd.playedInTournaments).to.be.an('Array');
          expect(member.rbd.playedInTournaments).to.have.length(0);
          expect(member.rbd.totalScores).to.be.an('Object');
          expect(member.rbd.totalScores.numTournaments).to.equal(0);
          expect(member.rbd.totalScores.averageScore).to.equal(0);
          expect(member.rbd.totalScores.averageMatchPoints).to.equal(0);
          expect(member.rbd.totalScores.awards).to.equal(0);
          expect(member.rbd.monthlyScores).to.be.an('Array');
          expect(member.rbd.monthlyScores).to.have.length(0);
          expect(member.registeredAt).to.be.undefined;
          expect(member.validatedAt).to.be.undefined;
          expect(member.createdAt).to.be.a('Date');
          // expect(p.updatedAt).to.equal(p.createdAt);
          done();
        }
      ]);
    });
  });

  describe('update', function () {
    it('should update the database', function (done) {
      async.waterfall([
        function (callback) {
          new Member({
            bboName: 'bboname',
            name: 'name',
            email: 'pluto@minnie.com',
            nation: 'Italy'
          }).save(function (err, member) {
            callback(err, member);
          });
        },
        function (member, callback) {
          var id = member._id;
          var obj = member.toObject(); // Update expects a simple javascript object, not a mongoose object
          delete obj._id; // And you can't change the _id.
          obj.name = 'changed';
          obj.level = 'Expert';
          Member.findByIdAndUpdate(id, { $set: obj }, function (err) {
            callback(err);
          });
        },
        function (callback) {
          Member.findOne({ bboName: 'bboname' }, function (err, member) {
            callback(err, member);
          });
        },
        function (member) {
          expect(member.name).to.equal('changed');
          expect(member.level).to.equal('Expert');
          done();
        }
      ]);
    });
  });

  describe('validation', function () {
    it('should throw an error on empty BBO name', function (done) {
      new Member({
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
      new Member({
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
      new Member({
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
      new Member({
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
      new Member({
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
      new Member({
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
          new Member({
            bboName: 'bboname',
            name: 'name',
            email: 'pluto@minnie.com',
            nation: 'Italy'
          }).save(function (err, member) {
            callback(err);
          });
        },
        function (callback) {
          new Member({
            bboName: 'bboname',
            name: 'pippo',
            email: 'pippo@minnie.com',
            nation: 'Italy'
          }).save(function (err, player) {
            callback(null, err);
          });
        },
        function (err) {
          expect(err.message).to.equal('E11000 duplicate key error index: bbofans_test.members.$bboName_1  dup key: { : "bboname" }');
          done();
        }
      ]);
    });
  });
});
