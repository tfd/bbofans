/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Setup = mongoose.model('Setup');
var _ = require('underscore');
var Handlebars = require('handlebars');

var templates = {};

module.exports = function () {

  return {
    getEmailText: function (type, data, cb) {
      console.log('getEmailtext', type, data);
      Setup.findOne({}, function (err, setup) {
        if (err) {
          cb(err);
        }

        if (!setup) {
          cb(err, null);
        }

        if (!templates[type]) {
          _.each(setup.emailTexts, function (emailText) {
            if (emailText.type === type) {
              templates[type] = {
                title: Handlebars.compile(emailText.title),
                text : Handlebars.compile(emailText.text)
              };
              return false;
            }
          });
        }

        if (!templates[type]) {
          cb({error: 'No email of type ' + type});
        }

        cb(null, {title: templates[type].title(data), text: templates[type].text(data)});
      });

    }
  };
};
