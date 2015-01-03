/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var _ = require('underscore');

var User = Backbone.Model.extend({
  urlRoot: "users",
  idAttribute: "_id",
  
  defaults: {
    username: "",
    password: "",
    isMemberManager: false,
    isBlacklistManager: false,
    isTdManager: false,
    isUserManager: false
  },

  validate: function(attrs) {
    var errors = {};
    if (! attrs.username) {
      errors.username = "can't be blank";
    }
    if (! attrs.password) {
      errors.password = "can't be blank";
    }
    if( ! _.isEmpty(errors)){
      return errors;
    }
  }
});

module.exports = User;
