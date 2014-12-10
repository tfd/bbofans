/*!
 * Module dependencies.
 */

var async = require('async')
var auth = require('./middlewares/authorization');
var login = require('./middlewares/authentication');

/**
 * Route middlewares
 */

var memberAuth = [auth.requiresLogin, auth.member.hasAuthorization];
var tdAuth = [auth.requiresLogin, auth.td.hasAuthorization];
var blacklistAuth = [auth.requiresLogin, auth.blacklist.hasAuthorization];
var userAuth = [auth.requiresLogin, auth.user.hasAuthorization];

/**
 * Controllers
 */

var index = require('../src/controllers/index');
var members = require('../src/controllers/members');
var admin = require('../src/controllers/admin');
var recaptcha = require('../src/controllers/recaptcha');
var login = require('./middlewares/authentication');
/**
 * Expose routes
 */

module.exports = function (app, config, passport) {
  // home route
  app.get('/recaptcha/:challenge/:response', recaptcha.check);
  app.get('/members/rock', members.getRock);
  app.get('/members/rbd', members.getRbd);
  app.post('/admin/session', login(app, config, passport));
  app.get('/admin/members', memberAuth, members.getAll);
  app.post('/admin/members', memberAuth, members.add);
  app.put('/admin/members', memberAuth, members.update);
  app.get('/admin/members/:id', members.getById);
  app.delete('/admin/members/:id', members.delete);
  app.get('/admin/logout', admin.logout);
  app.get('/*', index.index);
}
