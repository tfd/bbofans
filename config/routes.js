/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var index = require('../app/controllers/index');

/**
 * Expose routes
 */

module.exports = function (app, passport) {
  // home route
  app.get('/', articles.index);
}
