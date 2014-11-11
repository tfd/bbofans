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
    var memberStub = null;
    var memberModelStub = null;
    var results = [];

    beforeEach(function() {
      req.body = {
        results: []
      };
      memberModelStub = {
        find: sinon.spy(function(query, callback) {
          callback(null, memberStub);
        })
      };
      modelStub.Tournament = sinon.spy(function() {
        newTournament = this;
        newTournament.results = results;
        modelStub.Tournament.prototype.save = sinon.spy(function(callback) {
          callback(null, newTournament);
        });
        modelStub.Tournament.prototype.model = sinon.spy(function(name) {
          return memberModelStub;
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
      memberStub = {
        addTournament: sinon.spy(function (t) {}),
        save: sinon.spy(function (cb) { cb(null, memberStub); })
      };
      
      results = [
        {
          players: ['bill'],
        }
      ];

      tournaments.add(req, res);
      expect(newTournament.model).calledWith('Member');
      expect(memberModelStub.find).calledWith({bboName: 'bill'});
      expect(memberStub.addTournament).calledWith(newTournament);
      expect(memberStub.save).calledAfter(memberStub.addTournament);
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
