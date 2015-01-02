/* jshint -W030 */
var proxyquire = require('proxyquire'),
    tournamentStub = sinon.spy(function () {  }),
    memberStub = {},
    mongooseStub = { model: function (name) { return (name === 'Tournament' ? tournamentStub : memberStub); } },
    tournaments = proxyquire('../../src/controllers/tournaments', {
      'mongoose' : mongooseStub
    });

var res = {},
    req = {};

describe('Tournaments Controller', function() {
  beforeEach(function() {
    res = {
      json: sinon.spy()
    };
    req = {
      params: {
        id : 1
      }
    };
    tournamentStub.find = function(query, callback) {
      callback(null, {});
    };
    tournamentStub.save = function(err, callback) {
      callback(null, req.body);
    };
  });

  it('should exist', function() {
    expect(tournaments).to.exist;
  });

  describe('index', function() {
    it('should be defined', function() {
      expect(tournaments.index).to.be.a('function');
    });

    it('should send json', function() {
      tournaments.index(req, res);
      expect(res.json).calledOnce;
    });
  });

  describe('getById', function() {
    it('should be defined', function() {
      expect(tournaments.getById).to.be.a('function');
    });

    it('should send json on successful retrieve', function() {
      tournaments.getById(req, res);
      expect(res.json).calledOnce;
    });

    it('should send json error on error', function() {
      tournamentStub.find = function(query, callback) {
        callback({}, null);
      };
      tournaments.getById(req, res);
      expect(res.json).calledWith({error: 'Tournament not found.'});
    });
  });

  describe('add', function() {
    var newTournament = null;
    var member = null;

    beforeEach(function() {
      req.body = {
        results: []
      };
      newTournament = { results: [] };
      tournamentStub.prototype.save = sinon.spy(function(callback) {
        callback(null, newTournament);
      });
      memberStub.find = sinon.spy(function(query, callback) {
        callback(null, member);
      });
    });

    it('should be defined', function() {
      expect(tournaments.add).to.be.a('function');
    });

    it('should return json on save', function() {
      tournaments.add(req, res);
      expect(tournamentStub).calledWith(req.body);
      expect(res.json).calledWith(newTournament);
    });

    it('should add tournament to players', function() {
      member = {
        addTournament: sinon.spy(function (t) {}),
        save: sinon.spy(function (cb) { cb(null, member); })
      };
      
      newTournament.results = [{
        players: ['bill']
      }];

      tournaments.add(req, res);
      expect(memberStub.find).calledWith({bboName: 'bill'});
      expect(member.addTournament).calledWith(newTournament);
      expect(member.save).calledAfter(member.addTournament);
      expect(res.json).calledWith(newTournament);
    });

    it('should return error on failed save', function() {
      tournamentStub.prototype.save = function(callback) {
        callback({}, null);
      };

      tournaments.add(req, res);
      expect(res.json).calledWith({error: 'Error adding Tournament.'});
    });
  });

  describe('delete', function() {
    beforeEach(function() {
      req.body = {
        id: '1',
        name: 'testing',
        date: Date.now,
        numPlayers: 0,
        isPair: false,
        isBD: false,
        results: []
      };
    });

    it('should be defined', function() {
      expect(tournaments.delete).to.be.a('function');
    });

    it('should return json on delete', function() {
      var contactSpy = {remove: sinon.spy()};
      tournamentStub.findOne = function(query, callback) {
        callback(null, contactSpy);
      };

      tournaments.delete(req, res);
      expect(contactSpy.remove).calledOnce;
    });

    it('should return error on failed save', function() {
      tournamentStub.findOne = function(query, callback) {
        callback({}, null);
      };

      tournaments.delete(req, res);
      expect(res.json).calledWith({error: 'Tournament not found.'});
    });
  });
});
