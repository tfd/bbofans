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
var commands = require('../src/controllers/commands');
var blacklists = require('../src/controllers/blacklists');
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
  app.post('/register', members.register);
  app.post('/admin/session', login(app, config, passport));
  app.get('/admin/members', memberAuth, members.getAll);
  app.post('/admin/members', memberAuth, members.add);
  app.put('/admin/members/:id', memberAuth, members.update);
  app.get('/admin/members/:id', memberAuth, members.getById);
  app.delete('/admin/members/:id', memberAuth, members.delete);
  app.post('/admin/commands/enable', memberAuth, commands.enable);
  app.post('/admin/commands/disable', memberAuth, commands.disable);
  app.post('/admin/commands/blacklist', memberAuth, commands.blacklist);
  app.post('/admin/commands/validate', memberAuth, commands.validate);
  app.post('/admin/commands/email', memberAuth, commands.email);
  app.get('/admin/blacklist', blacklistAuth, blacklists.getList);
  app.post('/admin/blacklist', blacklistAuth, blacklists.add);
  app.put('/admin/blacklist/:id', blacklistAuth, blacklists.update);
  app.get('/admin/blacklist/:id', blacklistAuth, blacklists.getById);
  app.get('/admin/logout', admin.logout);
  app.get('/*', index.index);
}
