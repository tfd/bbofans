/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var moment = require('moment');
var _ = require('underscore');

var Password = Backbone.Model.extend({
  urlRoot: 'admin/account/password',
  idAttribute: "_id",

  defaults: {
    currentPassword: '',
    newPassword: '',
    repeatPassword: ''
  },

  validate: function(attrs) {
    var errors = {};
    if (! attrs.currentPassword) {
      errors.currentPassword = "can't be blank";
    }
    if (! attrs.newPassword) {
      errors.newPassword = "can't be blank";
    }
    if (attrs.newPassword !== attrs.repeatPassword) {
      errors.repeatPassword = "doesn't match";
    }
    if(!_.isEmpty(errors)) {
      return errors;
    }
  }

});

module.exports = Password;
