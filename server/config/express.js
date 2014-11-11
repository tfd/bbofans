
/**
 * Module dependencies.
 */

var express = require('express');
var exphbs = require('express-handlebars');
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

  // Create handlebars engine
  var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: config.root + '/server/src/views/layouts',
    partialsDir: config.root + '/server/src/views/partials'
  });

  // set views path, template engine and default layout
  app.enable('view cache');
  app.engine('hbs', hbs.engine);
  app.set('views', config.root + '/server/src/views');
  app.set('view engine', 'hbs');

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
