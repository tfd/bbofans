/* jshint -W097 */
"use strict";

/*!
 * Module dependencies.
 */

var express = require('express');
var async = require('async');
var auth = require('./middleware/authorization');
var login = require('./middleware/authentication');

module.exports = function (app, config, passport) {

  /**
   * Route middleware
   */

  var loginAuth = [auth.requiresLogin];
  var memberAuth = [auth.requiresLogin, auth.isSameUser];
  var memberManagerAuth = [auth.requiresLogin, auth.member.hasAuthorization];
  var tdAuth = [auth.requiresLogin, auth.td.hasAuthorization];
  var tdManagerAuth = [auth.requiresLogin, auth.tdManager.hasAuthorization];
  var tdOrTdManagerAuth = [auth.requiresLogin, auth.tdOrTdManager.hasAuthorization];
  var blacklistManagerAuth = [auth.requiresLogin, auth.blacklist.hasAuthorization];
  var emailAuth = [auth.requiresLogin, auth.email.hasAuthorization];
  var setupAuth = [auth.requiresLogin, auth.setup.hasAuthorization];

  /**
   * Controllers
   */

  var index = require('../src/controllers/index')(config);
  var countries = require('../src/controllers/countries')(config);
  var accounts = require('../src/controllers/accounts')(config);
  var admin = require('../src/controllers/admin')(config);
  var members = require('../src/controllers/members')(config);
  var commands = require('../src/controllers/commands')(config);
  var blacklists = require('../src/controllers/blacklists')(config);
  var tds = require('../src/controllers/tds')(config);
  var tournaments = require('../src/controllers/tournaments')(config);
  var updater = require('../src/controllers/updater')(config);
  var setup = require('../src/controllers/setup')(config);
  var promotion = require('../src/controllers/promotion')(config);


  /**
   * Expose routes
   */

  var router = express.Router();

  // home route
  router.get('/tournaments/update', updater.update);
  router.get('/blacklist/update', blacklists.updateMembers);
  router.get('/members/rock', members.getRock);
  router.get('/members/rbd', members.getRbd);
  router.get('/winners/rock', members.getRockWinners);
  router.get('/winners/rbd', members.getRbdWinners);
  router.post('/register', accounts.register);
  router.get('/register/:id', accounts.getRegistrant);
  router.get('/register/confirm/:id', accounts.confirmEmail);
  router.get('/promotion/promote', promotion.promote);
  router.get('/countries', countries.get);
  router.get('/admin/session', admin.getUser);
  router.post('/admin/session', login(app, config, passport));
  router.get('/admin/account/:id', memberAuth, members.getById);
  router.put('/admin/account/:id', memberAuth, members.update);
  router.put('/admin/account/password/:id', memberAuth, accounts.changePassword);
  router.post('/admin/account/forgot', accounts.forgotPassword);
  router.put('/admin/account/forgot', accounts.forgotPassword);
  router.get('/admin/account/reset/:id/:password', accounts.resetPassword);
  router.put('/admin/account/confirm/:id', accounts.changePassword);
  router.get('/admin/members', memberManagerAuth, members.getAll);
  router.get('/admin/members/bboNames', loginAuth, members.getBboNames);
  router.post('/admin/members', memberManagerAuth, members.add);
  router.get('/admin/members/saveAs', memberManagerAuth, members.saveAs);
  router.get('/admin/members/saveAs/:type', memberManagerAuth, members.saveAs);
  router.put('/admin/members/:id', memberManagerAuth, members.update);
  router.get('/admin/members/:id', memberManagerAuth, members.getById);
  router.get('/admin/members/bboName/:bboName', memberManagerAuth, members.getByBboName);
  router.delete('/admin/members/:id', memberManagerAuth, members.remove);
  router.post('/admin/commands/enable', memberManagerAuth, commands.enable);
  router.post('/admin/commands/disable', memberManagerAuth, commands.disable);
  router.post('/admin/commands/blacklist', memberManagerAuth, commands.blacklist);
  router.post('/admin/commands/validate', memberManagerAuth, commands.validate);
  router.post('/admin/commands/email', memberManagerAuth, commands.email);
  router.get('/admin/blacklist', tdAuth, blacklists.getList);
  router.post('/admin/blacklist/entry', blacklistManagerAuth, blacklists.addEntry);
  router.get('/admin/blacklist/bboName/:bboName', blacklistManagerAuth, blacklists.getByBboName);
  router.get('/admin/blacklist/bboNames', blacklistManagerAuth, blacklists.getBboNames);
  router.get('/admin/blacklist/saveAs', blacklistManagerAuth, blacklists.saveAs);
  router.get('/admin/blacklist/saveAs/:type', blacklistManagerAuth, blacklists.saveAs);
  router.get('/admin/blacklist/:id', tdAuth, blacklists.getById);
  router.put('/admin/blacklist/:id', blacklistManagerAuth, blacklists.update);
  router.get('/admin/tds', tdOrTdManagerAuth, tds.getAll);
  router.get('/admin/tds/bboNames', loginAuth, tds.getBboNames);
  router.get('/admin/tds/saveAs', tdManagerAuth, tds.saveAs);
  router.get('/admin/tds/saveAs/:type', tdManagerAuth, tds.saveAs);
  router.put('/admin/tds/:id', tdManagerAuth, tds.update);
  router.get('/admin/tds/:id', tdOrTdManagerAuth, tds.getById);
  router.get('/admin/setup/emails/:type', emailAuth, setup.getEmailText);
  router.post('/admin/setup/emails', emailAuth, setup.saveEmailText);
  router.get('/admin/setup/rules', setupAuth, setup.getRules);
  router.post('/admin/setup/rules', setupAuth, setup.saveRules);
  router.get('/tournaments', tournaments.getAll);
  router.get('/tournaments/rock', tournaments.getRock);
  router.get('/tournaments/rbd', tournaments.getRbd);
  router.get('/admin/logout', admin.logout);
  router.get('/*', index.index);

  app.use('/', router);
};
