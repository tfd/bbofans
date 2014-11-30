/* jshint -W030 */
var proxyquire = require('proxyquire'),
    memberStub = sinon.spy( function () { return; } ),
    mongooseStub = { model: function () { return memberStub; } },
    members = proxyquire('../../src/controllers/members', {
        'mongoose' : mongooseStub
    });

var res = {},
    req = {},
    aggr = {},
    query = {};

describe('Members Controller', function () {
  beforeEach(function () {
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
    memberStub.find = function (query, callback) {
      callback(null, {});
    };
    memberStub.save = function (err, callback) {
      callback(null, req.body);
    };
  });

  it('should exist', function () {
    expect(members).to.exist;
  });

  describe('index', function () {
    it('should be defined', function () {
      expect(members.index).to.be.a('function');
    });

    it('should send json', function () {
      members.index(req, res);
      expect(res.json).calledOnce;
    });
  });

  describe('getRock', function () {
    beforeEach(function () {
      aggr = {
        sort: sinon.spy(function (sort) { return aggr; }),
        skip: sinon.spy(function (skip) { return aggr; }),
        limit: sinon.spy(function (limit) { return aggr; }),
        exec: sinon.spy(function (callback) { callback (null, {}); })
      };
      memberStub.find = function () {
        return {
          count: function (callback) { callback(null, 20); }
        };
      };
      memberStub.aggregate = sinon.spy(function (a) { return aggr; });
    });

    it('should be defined', function () {
      expect(members.getRock).to.be.a('function');
    });

    it('should have default values', function () {
      req.query = {};
      members.getRock(req, res);
      expect(memberStub.aggregate).calledWith({
        $project: {
          bboName: 1,
          nation: 1,
          level: 1,
          awards: "$rock.totalScores.awards",
          averageMatchPoints: "$rock.totalScores.averageMatchPoints"
        }
      });
      expect(aggr.sort).calledWith({ bboName: 1 });
      expect(aggr.skip).calledWith(0);
      expect(aggr.limit).calledWith(10);
      expect(aggr.exec).calledOnce;
    });

    it('should return json', function () {
      req.query = {};
      members.getRock(req, res);
      expect(res.json).calledOnce;
      expect(res.json).calledWith({
        skip: 0,
        limit: 10,
        sort: { bboName: 1 },
        total: 20,
        rows: {}
      });
    });

    it('should read values from query string', function () {
      req.query = {
        offset: '10',
        limit: '15',
        sort: 'level',
        order: 'asc'
      };
      members.getRock(req, res);
      expect(aggr.sort).calledWith({ level: 1 });
      expect(aggr.skip).calledWith(10);
      expect(aggr.limit).calledWith(15);
    });

    it('should work with descending sort order', function () {
      req.query = {
        order: 'desc'
      };
      members.getRock(req, res);
      expect(aggr.sort).calledWith({ bboName: -1 });
    });

    it('should work with bad sort field', function () {
      req.query = {
        order: 'bbo'
      };
      members.getRock(req, res);
      expect(aggr.sort).calledWith({ bboName: 1 });
    });

    it('should work with bad sort order', function () {
      req.query = {
        order: 'Desc'
      };
      members.getRock(req, res);
      expect(aggr.sort).calledWith({ bboName: 1 });
    });
    
    it('should work with bad offset', function () {
      req.query = {
        offset: 'Nan'
      };
      members.getRock(req, res);
      expect(aggr.skip).calledWith(0);
    });

    it('should work with bad limit', function () {
      req.query = {
        limit: 'NaN'
      };
      members.getRock(req, res);
      expect(aggr.limit).calledWith(10);
    });

  });

  describe('getRbd', function () {
    beforeEach(function () {
      aggr = {
        sort: sinon.spy(function (sort) { return aggr; }),
        skip: sinon.spy(function (skip) { return aggr; }),
        limit: sinon.spy(function (limit) { return aggr; }),
        exec: sinon.spy(function (callback) { callback (null, {}); })
      };
      memberStub.find = function () {
        return {
          count: function (callback) { callback(null, 20); }
        };
      };
      memberStub.aggregate = sinon.spy(function (a) { return aggr; });
    });

    it('should be defined', function () {
      expect(members.getRbd).to.be.a('function');
    });

    it('should have default values', function () {
      req.query = {};
      members.getRbd(req, res);
      expect(memberStub.aggregate).calledWith([
        { $match: { isRbdPlayer: true } },
        { $project: {
            bboName: 1,
            nation: 1,
            level: 1,
            awards: "$rock.totalScores.awards",
            averageMatchPoints: "$rock.totalScores.averageMatchPoints"
          }
        }
      ]);
      expect(aggr.sort).calledWith({ bboName: 1 });
      expect(aggr.skip).calledWith(0);
      expect(aggr.limit).calledWith(10);
      expect(aggr.exec).calledOnce;
    });

    it('should return json', function () {
      req.query = {};
      members.getRbd(req, res);
      expect(res.json).calledOnce;
      expect(res.json).calledWith({
        skip: 0,
        limit: 10,
        sort: { bboName: 1 },
        total: 20,
        rows: {}
      });
    });

    it('should read values from query string', function () {
      req.query = {
        offset: '10',
        limit: '15',
        sort: 'level',
        order: 'asc'
      };
      members.getRbd(req, res);
      expect(aggr.sort).calledWith({ level: 1 });
      expect(aggr.skip).calledWith(10);
      expect(aggr.limit).calledWith(15);
    });

    it('should work with descending sort order', function () {
      req.query = {
        order: 'desc'
      };
      members.getRbd(req, res);
      expect(aggr.sort).calledWith({ bboName: -1 });
    });

    it('should work with bad sort field', function () {
      req.query = {
        order: 'bbo'
      };
      members.getRbd(req, res);
      expect(aggr.sort).calledWith({ bboName: 1 });
    });

    it('should work with bad sort order', function () {
      req.query = {
        order: 'Desc'
      };
      members.getRbd(req, res);
      expect(aggr.sort).calledWith({ bboName: 1 });
    });
    
    it('should work with bad offset', function () {
      req.query = {
        offset: 'Nan'
      };
      members.getRbd(req, res);
      expect(aggr.skip).calledWith(0);
    });

    it('should work with bad limit', function () {
      req.query = {
        limit: 'NaN'
      };
      members.getRbd(req, res);
      expect(aggr.limit).calledWith(10);
    });

  });

  describe('getById', function () {
    it('should be defined', function () {
      expect(members.getById).to.be.a('function');
    });

    it('should send json on successful retrieve', function () {
      members.getById(req, res);
      expect(res.json).calledOnce;
    });

    it('should send json error on error', function () {
      memberStub.find = function (query, callback) {
        callback(null, {error: 'Player not found.'});
      };
      members.getById(req, res);
      expect(res.json).calledWith({error: 'Player not found.'});
    });
  });

  describe('add', function () {
    beforeEach(function () {
      req.body = {
        name: 'testing',
        email: 'test@testing.com',
        phone: '123-456-7890'
      };
    });

    it('should be defined', function () {
      expect(members.add).to.be.a('function');
    });

    it('should return json on add', function () {
      memberStub.prototype.save = function (callback) {
        callback(null, req.body);
      };

      members.add(req, res);
      expect(res.json).calledWith(req.body);
    });

    it('should return error on failed add', function () {
      memberStub.prototype.save = function (callback) {
        callback({err: 'E11000 duplicate key error members.$bboName_1 dup key: { : "name" }'}, req.body);
      };

      members.add(req, res);
      expect(res.status).calledWith(409);
      expect(res.json).calledWith({bboName: 'Value "name" already present in database'});
    });
  });

  describe('update', function () {
    beforeEach(function () {
      req.body = {
        _id: '1234',
        name: 'testing',
        email: 'test@testing.com',
        phone: '123-456-7890'
      };
    });

    it('should be defined', function () {
      expect(members.update).to.be.a('function');
    });

    it('should call findByIdAndUpdate', function () {
      memberStub.findByIdAndUpdate = sinon.spy(function (id, update, callback) {
        callback(null, req.body);
      });

      members.update(req, res);

      expect(memberStub.findByIdAndUpdate).calledWith('1234', { $set: {
        name: 'testing',
        email: 'test@testing.com',
        phone: '123-456-7890'
      }});
    });

    it('should return json on update', function () {
      memberStub.findByIdAndUpdate = sinon.spy(function (id, update, callback) {
        callback(null, req.body);
      });

      members.update(req, res);

      expect(res.json).calledWith(req.body);
    });

    it('should return error on failed update', function () {
      memberStub.findByIdAndUpdate = sinon.spy(function (id, update, callback) {
        callback({}, req.body);
      });

      members.update(req, res);
      
      expect(res.json).calledWith({error: 'Error updating member.'});
    });
  });

  describe('delete', function () {
    beforeEach(function () {
      req.body = {
        id: '1',
        name: 'testing',
        email: 'test@testing.com',
        phone: '123-456-7890'
      };
    });

    it('should be defined', function () {
      expect(members.delete).to.be.a('function');
    });

    it('should return json on delete', function () {
      var contactSpy = {remove: sinon.spy()};
      memberStub.findOne = function (query, callback) {
        callback(null, contactSpy);
      };

      members.delete(req, res);
      expect(contactSpy.remove).calledOnce;
    });
    it('should return error on failed save', function () {
      memberStub.findOne = function (query, callback) {
        callback({}, {});
      };

      members.delete(req, res);
      expect(res.json).calledWith({error: 'Member not found.'});
    });
  });
});
