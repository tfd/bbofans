/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var moment = require('moment');
var _ = require('underscore');

var Password = Backbone.Model.extend({
  urlRoot    : 'admin/commands/blacklist',
  idAttribute: "_id",

  defaults: {
    rows  : [],
    from  : moment.utc(),
    for   : '6d',
    reason: ''
  },

  validate: function (attrs, options) {
    var errors = {};
    if (!attrs.reason) {
      errors.reason = "can't be blank";
    }
    if (!attrs.from) {
      errors.from = "can't be blank";
    }
    else {
      if (!moment.utc(attrs.from).isValid()) {
        errors.from = "is invalid";
      }
    }
    if (!attrs.for) {
      errors.for = "can't be blank";
    }
    else {
      var num = parseInt(attrs.for, 10);
      var type = attrs.for.slice(-1);
      if (type === 'F') {
        if (attrs.for !== 'F') {
          errors.for = "invalid period";
        }
      }
      else if (isNaN(num) || num <= 0 || ['d', 'w', 'M'].indexOf(type) < 0) {
        errors.for = "invalid period";
      }
    }
    if (!_.isEmpty(errors)) {
      return errors;
    }
  },

  set: function (attributes, options) {
    if (attributes.from) {
      attributes.from = moment.utc(attributes.from, "DD/MM/YYYY").toISOString();
    }
    return Backbone.Model.prototype.set.call(this, attributes, options);
  }
});

module.exports = Password;
