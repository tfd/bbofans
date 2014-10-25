
/**
 * Module dependencies.
 */

var express = require('express');
var env = process.env.NODE_ENV || 'dev'

module.exports = function (app, config, passport) {

  app.set('showStackError', true)

  // should be placed before express.static
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
    },
    level: 9
  }));

  app.use(express.favicon());
  app.use(express.static(config.root + '/public'));

  // Logging
  // Don't log during tests
  if (env !== 'test') app.use(express.logger('dev'));

  // set views path, template engine and default layout
  app.enable('view cache');
  app.engine('hogan', require('hogan-express'));
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'hogan');

  app.configure(function () {
    // bodyParser should be above methodOverride
    app.use(express.bodyParser())
    app.use(express.methodOverride())

    // routes should be at the last
    app.use(app.router)
  });

  // development env config
  app.configure('dev', function () {
    app.locals.pretty = true
  });
}
