/* jshint -W097 */
"use strict";

/*!
 * Module dependencies.
 */

var async = require('async');
var auth = require('./middleware/authorization');
var login = require('./middleware/authentication');

/**
 * Route middleware
 */

var loginAuth = [auth.requiresLogin];
var memberAuth = [auth.requiresLogin, auth.isSameUser];
var memberManagerAuth = [auth.requiresLogin, auth.member.hasAuthorization];
var tdAuth = [auth.requiresLogin, auth.td.hasAuthorization];
var tdManagerAuth = [auth.requiresLogin, auth.tdManager.hasAuthorization];
var blacklistManagerAuth = [auth.requiresLogin, auth.blacklist.hasAuthorization];

/**
 * Controllers
 */

var index = require('../src/controllers/index');
var countries = require('../src/controllers/countries');
var register = require('../src/controllers/register');
var admin = require('../src/controllers/admin');
var members = require('../src/controllers/members');
var commands = require('../src/controllers/commands');
var blacklists = require('../src/controllers/blacklists');
var tds = require('../src/controllers/tds');
var reCaptcha = require('../src/controllers/reCaptcha');
var updater = require('../src/controllers/updater');


/**
 * Expose routes
 */

module.exports = function (app, config, passport) {
  // home route
  app.get('/reCaptcha/:response', reCaptcha.check);
  app.get('/update', updater.update);
  app.get('/members/rock', members.getRock);
  app.get('/members/rbd', members.getRbd);
  app.post('/register', register.register);
  app.get('/register/:id', register.getRegistrant);
  app.get('/register/confirm/:id', register.confirmEmail);
  app.get('/countries', countries.get);
  app.get('/admin/session', admin.getUser);
  app.post('/admin/session', login(app, config, passport));
  app.get('/admin/account/:id', memberAuth, members.getById);
  app.put('/admin/account/:id', memberAuth, members.update);
  app.put('/admin/account/password/:id', memberAuth, members.changePassword);
  app.get('/admin/members', memberManagerAuth, members.getAll);
  app.get('/admin/members/bboName', loginAuth, members.getBboNames);
  app.post('/admin/members', memberManagerAuth, members.add);
  app.get('/admin/members/saveAs', memberManagerAuth, members.saveAs);
  app.get('/admin/members/saveAs/:type', memberManagerAuth, members.saveAs);
  app.put('/admin/members/:id', memberManagerAuth, members.update);
  app.get('/admin/members/:id', memberManagerAuth, members.getById);
  app.delete('/admin/members/:id', memberManagerAuth, members.remove);
  app.post('/admin/commands/enable', memberManagerAuth, commands.enable);
  app.post('/admin/commands/disable', memberManagerAuth, commands.disable);
  app.post('/admin/commands/blacklist', memberManagerAuth, commands.blacklist);
  app.post('/admin/commands/validate', memberManagerAuth, commands.validate);
  app.post('/admin/commands/email', memberManagerAuth, commands.email);
  app.get('/admin/blacklist', tdAuth, blacklists.getList);
  app.post('/admin/blacklist/entry', blacklistManagerAuth, blacklists.addEntry);
  app.get('/admin/blacklist/bboName', blacklistManagerAuth, blacklists.getByBboName);
  app.get('/admin/blacklist/saveAs', blacklistManagerAuth, blacklists.saveAs);
  app.get('/admin/blacklist/saveAs/:type', blacklistManagerAuth, blacklists.saveAs);
  app.get('/admin/blacklist/:id', tdAuth, blacklists.getById);
  app.put('/admin/blacklist/:id', blacklistManagerAuth, blacklists.update);
  app.get('/admin/tds', tdManagerAuth, tds.getAll);
  app.get('/admin/tds/saveAs', tdManagerAuth, tds.saveAs);
  app.get('/admin/tds/saveAs/:type', tdManagerAuth, tds.saveAs);
  app.put('/admin/tds/:id', tdManagerAuth, tds.update);
  app.get('/admin/tds/:id', tdManagerAuth, tds.getById);
  app.get('/admin/logout', admin.logout);
  app.get('/*', index.index);
};
