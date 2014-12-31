/*!
 * Module dependencies.
 */

var async = require('async')
var auth = require('./middlewares/authorization');
var login = require('./middlewares/authentication');

/**
 * Route middlewares
 */

var memberAuth = [auth.requiresLogin];
var memberManagerAuth = [auth.requiresLogin, auth.member.hasAuthorization];
var tdAuth = [auth.requiresLogin, auth.td.hasAuthorization];
var tdManagerAuth = [auth.requiresLogin, auth.tdManager.hasAuthorization];
var blacklistManagerAuth = [auth.requiresLogin, auth.blacklist.hasAuthorization];

/**
 * Controllers
 */

var index = require('../src/controllers/index');
var countries = require('../src/controllers/countries');
var admin = require('../src/controllers/admin');
var members = require('../src/controllers/members');
var commands = require('../src/controllers/commands');
var blacklists = require('../src/controllers/blacklists');
var tds = require('../src/controllers/tournamentDirectors');
var recaptcha = require('../src/controllers/recaptcha');
var updater = require('../src/controllers/updater');
var login = require('./middlewares/authentication');
/**
 * Expose routes
 */

module.exports = function (app, config, passport) {
  // home route
  app.get('/recaptcha/:challenge/:response', recaptcha.check);
  app.get('/update', updater.update);
  app.get('/members/rock', members.getRock);
  app.get('/members/rbd', members.getRbd);
  app.post('/register', members.register);
  app.get('/countries', countries.get);
  app.get('/admin/session', admin.getUser);
  app.post('/admin/session', login(app, config, passport));
  app.get('/admin/members', memberManagerAuth, members.getAll);
  app.get('/admin/members/bboName', memberManagerAuth, members.getBboNames);
  app.post('/admin/members', memberManagerAuth, members.add);
  app.get('/admin/members/export', memberManagerAuth, members.export);
  app.get('/admin/members/export/:type', memberManagerAuth, members.export);
  app.put('/admin/members/:id', memberManagerAuth, members.update);
  app.get('/admin/members/:id', memberManagerAuth, members.getById);
  app.delete('/admin/members/:id', memberManagerAuth, members.delete);
  app.post('/admin/commands/enable', memberManagerAuth, commands.enable);
  app.post('/admin/commands/disable', memberManagerAuth, commands.disable);
  app.post('/admin/commands/blacklist', memberManagerAuth, commands.blacklist);
  app.post('/admin/commands/validate', memberManagerAuth, commands.validate);
  app.post('/admin/commands/email', memberManagerAuth, commands.email);
  app.get('/admin/blacklist', blacklistManagerAuth, blacklists.getList);
  app.post('/admin/blacklist/entry', blacklistManagerAuth, blacklists.addEntry);
  app.get('/admin/blacklist/bboName', blacklistManagerAuth, blacklists.getByBboName);
  app.get('/admin/blacklist/export', blacklistManagerAuth, blacklists.export);
  app.get('/admin/blacklist/export/:type', blacklistManagerAuth, blacklists.export);
  app.put('/admin/blacklist/:id', blacklistManagerAuth, blacklists.update);
  app.get('/admin/blacklist/:id', blacklistManagerAuth, blacklists.getById);
  app.get('/admin/tds', tdManagerAuth, tds.getAll);
  app.get('/admin/tds/export', tdManagerAuth, tds.export);
  app.get('/admin/tds/export/:type', tdManagerAuth, tds.export);
  app.put('/admin/tds/:id', tdManagerAuth, tds.update);
  app.get('/admin/tds/:id', tdManagerAuth, tds.getById);
  app.get('/admin/logout', admin.logout);
  app.get('/*', index.index);
}
