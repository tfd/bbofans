/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var _ = require('underscore');

var Member = Backbone.Model.extend({
  urlRoot: "admin/members",
  idAttribute: "_id",
  
  defaults: {
    bboName: "",
    name: "",
    emails: [""],
    telephones: [""],
    nation: "Netherlands",
    level: "Beginner",
    isStarPlayer: false
  },

  validate: function(attrs) {
    var errors = {};
    var bboName = attrs.bboName.trim();
    if (! bboName) {
      errors.bboName = "can't be blank";
    }
    if (bboName.length > 10) {
      errors.bboName = "can't be longer then 10 characters";
    }
    if (/[^A-Za-z0-9_ \-]/.test(bboName)) {
      errors.bboName = "contains illegal characters";
    }
    if (! attrs.name.trim()) {
      errors.name = "can't be blank";
    }
    if (! attrs.emails || attrs.emails.length === 0 || ! attrs.emails[0]) {
      errors.emails = "can't be blank";
    }
    if( ! _.isEmpty(errors)){
      return errors;
    }
  },

  set: function(attributes, options) {
    if (attributes.bboName) {
      attributes.bboName = attributes.bboName.toLowerCase();
    }
    return Backbone.Model.prototype.set.call(this, attributes, options);
  }
});

module.exports = Member;
