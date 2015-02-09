/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Setup = mongoose.model('Setup');
var _ = require('underscore');

module.exports = {

  getEmailText: function (type, cb) {
    Setup.findOne({}, function (err, setup) {
      if (err) {
        cb(err);
      }

      if (!setup) {
        cb(err, null);
      }

      var email = null;
      _.each(setup.emailTexts, function (emailText) {
        if (emailText.type === type) {
          email = emailText;
        }
      });

      cb(null, email);
    });

  }
};
