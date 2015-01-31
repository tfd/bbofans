/* jshint -W097 */
"use strict";

/**
 * Module dependencies.
 */

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var morgan = require('morgan');
// var cookieParser = require('cookie-parser');
// var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
// var csrf = require('csurf');
var multer = require('multer');
var serveFavicon = require('serve-favicon');
var serveStatic = require('serve-static');
var exphbs = require('express-handlebars');
var flash = require('express-flash');
var env = process.env.NODE_ENV || 'prod';

module.exports = function (app, config, passport) {

  app.set('showStackError', true);

  // Favicon handling should be the very first middleware
  app.use(serveFavicon(config.root + '/public/favicon.ico'));

  // should be placed before express.static
  app.use(compression({
    filter: function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9,
    threshold: 512
  }));
  app.use(serveStatic(config.root + '/public'));

  // Logging
  // Don't log during tests
  if (env !== 'test') app.use(morgan('dev'));

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

  // bodyParser should be above methodOverride
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(multer());
  app.use(methodOverride());

  // Passport using a cookie sesssion to store user info.
  // app.use(cookieParser('Th1s i3 a l0Ng S3cre7'));
  app.use(session({
    secret: 'Th1s i3 a l0Ng S3cre7',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  // routes should be at the last
  // app.use(app.router)

};
