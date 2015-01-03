/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Member = require('./member');
var _ = require('underscore');

var Registrant = Member.extend({
  urlRoot: "register",

  validate: function(attrs) {
    var errors = Member.prototype.validate.call(this, attrs) || {};
    if (! attrs.password) {
      errors.password = "cannot be blank";
    }
    if (attrs.password !== attrs.repeatPassword) {
      errors.repeatPassword = "doesn't match";
    }
    if (!_.isEmpty(errors)) {
      return errors;
    }
  }

});

module.exports = Registrant;
