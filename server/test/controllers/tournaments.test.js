/* jshint -W030 */
var proxyquire = require('proxyquire'),
    modelStub = {},
    tournaments = proxyquire('../../src/controllers/tournaments', {
      '../models/tournament' : modelStub,
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
    modelStub.Tournament = {
      find: function(query, callback) {
        callback(null, {});
      },
      save: function(err, callback) {
        callback(null, req.body);
      }
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
      modelStub.Tournament = {
        find: function(query, callback) {
          callback({}, null);
        }
      };
      tournaments.getById(req, res);
      expect(res.json).calledWith({error: 'Tournament not found.'});
    });
  });

  describe('add', function() {
    var newTournament = null;
    var playerStub = null;
    var playerModelStub = null;
    var results = [];

    beforeEach(function() {
      req.body = {
        results: []
      };
      playerModelStub = {
        find: sinon.spy(function(query, callback) {
          callback(null, playerStub);
        })
      };
      modelStub.Tournament = sinon.spy(function() {
        newTournament = this;
        newTournament.results = results;
        modelStub.Tournament.prototype.save = sinon.spy(function(callback) {
          callback(null, newTournament);
        });
        modelStub.Tournament.prototype.model = sinon.spy(function(name) {
          return playerModelStub;
        });
        modelStub.Tournament.prototype.results = [];
      });
    });

    it('should be defined', function() {
      expect(tournaments.add).to.be.a('function');
    });

    it('should return json on save', function() {
      tournaments.add(req, res);
      expect(modelStub.Tournament).calledWith(req.body);
      expect(res.json).calledWith(newTournament);
    });

    it('should add tournament to players', function() {
      playerStub = {
        addTournament: sinon.spy(function (t) {}),
        save: sinon.spy(function (cb) { cb(null, playerStub); })
      };
      
      results = [
        {
          players: ['bill'],
        }
      ];

      tournaments.add(req, res);
      expect(newTournament.model).calledWith('Player');
      expect(playerModelStub.find).calledWith({bboName: 'bill'});
      expect(playerStub.addTournament).calledWith(newTournament);
      expect(playerStub.save).calledAfter(playerStub.addTournament);
      expect(res.json).calledWith(newTournament);
    });

    it('should return error on failed save', function() {
      modelStub.Tournament = sinon.spy(function() {
        modelStub.Tournament.prototype.save = function(callback) {
          callback({}, null);
        };
        return;
      });

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
      modelStub.Tournament = {
        findOne: function(query, callback) {
          callback(null, contactSpy);
        }
      };

      tournaments.delete(req, res);
      expect(contactSpy.remove).calledOnce;
    });

    it('should return error on failed save', function() {
      modelStub.Tournament = {
        findOne: function(query, callback) {
          callback({}, null);
        }
      };

      tournaments.delete(req, res);
      expect(res.json).calledWith({error: 'Tournament not found.'});
    });
  });
});
