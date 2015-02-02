/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var moment = require('moment');
var _ = require('underscore');

var ForgotPassword = Backbone.Model.extend({
  urlRoot: '/admin/account/forgot',
  idAttribute: "_id",

  defaults: {
    bboName: '',
    email: ''
  },

  validate: function(attrs) {
    var errors = {};
    if (! attrs.bboName && ! attrs.email) {
      errors.bboName = "can't be blank";
      errors.email = "can't be blank";
    }
    if (attrs.bboName.trim().length > 10) {
      errors.bboName = "can't be longer then 10 characters";
    }
    if(!_.isEmpty(errors)) {
      return errors;
    }
  }

});

module.exports = ForgotPassword;
