
/*!
* bbofans
* Copyright(c) 2014 Ronald van Uffelen <ronald.vanuffelen@gmail.com>
* GPL v2 Licensed
*/

/*
* Module dependencies.
*/

var express = require('express');
var fs = require('fs');
// var passport = require('passport');

/*
* Main application entry file.
* Please note that the order of loading is important.
*/

// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV || 'dev';
var config = require('./config/config')[env];
var mongoose = require('mongoose');

// Bootstrap db connection
// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } }
  mongoose.connect(config.db, options)
};

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err)
});

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect()
});
connect();

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

// bootstrap passport config
// require('./config/passport')(passport, config)

var app = express();
// express settings
require('./config/express')(app, config);

// Bootstrap routes
require('./config/routes')(app);

// Start the app by listening on <port>
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('BBOFans express server listening on port ' + port);
});

// expose app
exports = module.exports = app;
