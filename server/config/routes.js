/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var index = require('../src/controllers/index');
var members = require('../src/controllers/members');
var admin = require('../src/controllers/admin');
var recaptcha = require('../src/controllers/recaptcha');

/**
 * Expose routes
 */

module.exports = function (app, config, passport) {
  // home route
  app.get('/recaptcha/:challenge/:response', recaptcha.check);
  app.get('/members', members.index);
  app.get('/members/rock', members.getRock);
  app.get('/members/rbd', members.getRbd);
  app.get('/members/:id', members.getById);
  app.post('/members', members.add);
  app.put('/members', members.update);
  app.delete('/members/:id', members.delete);
  app.get('/admin/session',
    passport.authenticate('local', {
      failureRedirect: 'admin/login',
      failureFlash: 'Invalid email or password.'
    }), admin.session);
  app.get('/admin/logout', admin.logout);
  app.get('/*', index.index);
}
