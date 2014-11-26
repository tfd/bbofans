/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var index = require('../src/controllers/index');
var members = require('../src/controllers/members');
var recaptcha = require('../src/controllers/recaptcha');

/**
 * Expose routes
 */

module.exports = function (app, passport) {
  // home route
  app.get('/recaptcha/:challenge/:response', recaptcha.check);
  app.get('/members', members.index);
  app.get('/members/rock', members.getRock);
  app.get('/members/:id', members.getById);
  app.post('/members', members.add);
  app.put('/members', members.update);
  app.delete('/members/:id', members.delete);
  app.get('/*', index.index);
}
