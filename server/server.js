"use strict";

/*!
* bbofans
* Copyright(c) 2014 Ronald van Uffelen <ronald.vanuffelen@gmail.com>
* GPL v2 Licensed
*/

/*
* Module dependencies.
*/

var express = require('express');
var passport = require('passport');
var logger = require('./src/utils/logger');

/*
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV || 'prod';
var config = require('./config/config')[env];

// connect to database
require('./config/mongoose')(config);

// bootstrap passport config
require('./config/passport')(passport, config);

var app = express();

// express settings
require('./config/express')(app, config, passport);

// configure services
require('./config/services')(app, config, passport);

// Bootstrap routes
require('./config/routes')(app, config, passport);

// Error logging
var winston = require('winston');
var expressWinston = require('express-winston');
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      colorize: false
    })
  ]
}));

// Start the app by listening on <port>
var port = process.env.PORT || 3000;
app.listen(port, function () {
  logger.log('BBOFans express server listening on port ' + port);
});

// expose app
module.exports = app;
