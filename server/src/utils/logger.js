"use strict";

var winston = require('winston');

winston.loggers.add('bbofans', {
  console: {
    level: 'debug',
    colorize: true
  },
  file: {
    level: 'debug',
    filename: 'bbofans.log'
  }
});

module.exports = winston.loggers.get('bbofans');
