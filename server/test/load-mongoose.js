// Load configurations
var env = process.env.NODE_ENV || 'test';
var config = require('../../config/config')[env];
var mongoose = require('mongoose');

console.log('env=' + env);
console.log('db=' + config.db);

// Bootstrap db connection
// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.db, options);
};

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
});

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect();
});

connect();

module.export = mongoose;
