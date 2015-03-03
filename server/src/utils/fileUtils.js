/* jshint -W097 */
"use strict";

var fs = require('fs');
var logger = require('../utils/logger');

module.exports = {

  readFileToString: function (filename, callback) {
    fs.readFile(filename, 'utf8', function (err, contents) {
      if (err) {
        logger.error('fileUtils.readFileToString', err);
      }
      callback(err ? null : contents);
    });
  },

  readFileToJson: function (filename, callback) {
    this.readFileToString(filename, function (json) {
      if (!json) { return callback(null); }
      callback(JSON.parse(json));
    });
  }

};
