/* jshint -W030 */
var proxyquire = require('proxyquire'),
    modelStub = {},
    members = proxyquire('../../src/controllers/members', {
        '../models/member' : modelStub,
    });

var res = {},
    req = {};

describe('Members Controller', function() {
  beforeEach(function() {
    res = {
      status: sinon.spy(function (code) {
        return res;
      }),
      json: sinon.spy()
    };
    req = {
      params: {
        id : 1
      }
    };
    modelStub.Member = {
      find: function(query, callback) {
        callback(null, {});
      },
      save: function(err, callback) {
        callback(null, req.body);
      }
    };
  });

  it('should exist', function() {
    expect(members).to.exist;
  });

  describe('index', function() {
    it('should be defined', function() {
      expect(members.index).to.be.a('function');
    });

    it('should send json', function() {
      members.index(req, res);
      expect(res.json).calledOnce;
    });
  });

  describe('getById', function() {
    it('should be defined', function() {
      expect(members.getById).to.be.a('function');
    });

    it('should send json on successful retrieve', function() {
      members.getById(req, res);
      expect(res.json).calledOnce;
    });

    it('should send json error on error', function() {
      modelStub.Member = {
        find: function(query, callback) {
          callback(null, {error: 'Player not found.'});
        }
      };
      members.getById(req, res);
      expect(res.json).calledWith({error: 'Player not found.'});
    });
  });

  describe('add', function() {
    beforeEach(function() {
      req.body = {
        name: 'testing',
        email: 'test@testing.com',
        phone: '123-456-7890'
      };
    });

    it('should be defined', function() {
      expect(members.add).to.be.a('function');
    });

    it('should return json on add', function() {
      modelStub.Member = sinon.spy(function() {
        modelStub.Member.prototype.save = function(callback) {
          callback(null, req.body);
        };
        return;
      });

      members.add(req, res);
      expect(res.json).calledWith(req.body);
    });

    it('should return error on failed add', function() {
      modelStub.Member = sinon.spy(function() {
        modelStub.Member.prototype.save = function(callback) {
          callback({err: 'E11000 duplicate key error members.$bboName_1 dup key: { : "name" }'}, req.body);
        };
        return;
      });

      members.add(req, res);
      expect(res.status).calledWith(409);
      expect(res.json).calledWith({bboName: 'Value "name" already present in database'});
    });
  });

  describe('update', function() {
    beforeEach(function() {
      req.body = {
        _id: '1234',
        name: 'testing',
        email: 'test@testing.com',
        phone: '123-456-7890'
      };
    });

    it('should be defined', function() {
      expect(members.update).to.be.a('function');
    });

    it('should call findByIdAndUpdate', function() {
      modelStub.Member.findByIdAndUpdate = sinon.spy(function (id, update, callback) {
        callback(null, req.body);
      });

      members.update(req, res);

      expect(modelStub.Member.findByIdAndUpdate).calledWith('1234', { $set: {
        name: 'testing',
        email: 'test@testing.com',
        phone: '123-456-7890'
      }});
    });

    it('should return json on update', function() {
      modelStub.Member.findByIdAndUpdate = sinon.spy(function (id, update, callback) {
        callback(null, req.body);
      });

      members.update(req, res);

      expect(res.json).calledWith(req.body);
    });

    it('should return error on failed update', function() {
      modelStub.Member.findByIdAndUpdate = sinon.spy(function (id, update, callback) {
        callback({}, req.body);
      });

      members.update(req, res);
      
      expect(res.json).calledWith({error: 'Error updating member.'});
    });
  });

  describe('delete', function() {
    beforeEach(function() {
      req.body = {
        id: '1',
        name: 'testing',
        email: 'test@testing.com',
        phone: '123-456-7890'
      };
    });

    it('should be defined', function() {
      expect(members.delete).to.be.a('function');
    });

    it('should return json on delete', function() {
      var contactSpy = {remove: sinon.spy()};
      modelStub.Member = {
        findOne: function(query, callback) {
          callback(null, contactSpy);
        }
      };

      members.delete(req, res);
      expect(contactSpy.remove).calledOnce;
    });
    it('should return error on failed save', function() {
      modelStub.Member = {
        findOne: function(query, callback) {
          callback({}, {});
        }
      };

      members.delete(req, res);
      expect(res.json).calledWith({error: 'Member not found.'});
    });
  });
});
