/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var index = require('../server/src/controllers/index');

/**
 * Expose routes
 */

module.exports = function (app, passport) {
  // home route
  app.get('/', index.index);
}
