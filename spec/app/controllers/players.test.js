/* jshint -W030 */
var proxyquire = require('proxyquire'),
    modelStub = {},
    players = proxyquire('../../../app/controllers/players', {
        '../models/player' : modelStub,
    });

var res = {},
    req = {};

describe('Players Controller', function() {
    beforeEach(function() {
        res = {
            json: sinon.spy()
        };
        req = {
            params: {
                id : 1
            }
        };
        modelStub.Player = {
            find: function(query, callback) {
                callback(null, {});
            },
            save: function(err, callback) {
                callback(null, req.body);
            }
        };
    });

    it('should exist', function() {
        expect(players).to.exist;
    });

    describe('index', function() {
        it('should be defined', function() {
            expect(players.index).to.be.a('function');
        });

        it('should send json', function() {
            players.index(req, res);
            expect(res.json).calledOnce;
        });
    });

    describe('getById', function() {
        it('should be defined', function() {
            expect(players.getById).to.be.a('function');
        });

        it('should send json on successful retrieve', function() {
            players.getById(req, res);
            expect(res.json).calledOnce;
        });

        it('should send json error on error', function() {
            modelStub.Player = {
                find: function(query, callback) {
                    callback(null, {error: 'Player not found.'});
                }
            };
            players.getById(req, res);
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
            expect(players.add).to.be.a('function');
        });

        it('should return json on save', function() {

            modelStub.Player = sinon.spy(function() {
                modelStub.Player.prototype.save = function(callback) {
                    callback(null, req.body);
                };
                return;
            });

            players.add(req, res);
            expect(res.json).calledWith(req.body);
        });
        it('should return error on failed save', function() {

            modelStub.Player = sinon.spy(function() {
                modelStub.Player.prototype.save = function(callback) {
                    callback({}, req.body);
                };
                return;
            });

            players.add(req, res);
            expect(res.json).calledWith({error: 'Error adding player.'});
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
            expect(players.delete).to.be.a('function');
        });

        it('should return json on delete', function() {
            var contactSpy = {remove: sinon.spy()};
            modelStub.Player = {
                findOne: function(query, callback) {
                    callback(null, contactSpy);
                }
            };

            players.delete(req, res);
            expect(contactSpy.remove).calledOnce;
        });
        it('should return error on failed save', function() {
            modelStub.Player = {
                findOne: function(query, callback) {
                    callback({}, {});
                }
            };

            players.delete(req, res);
            expect(res.json).calledWith({error: 'Player not found.'});
        });
    });
});
