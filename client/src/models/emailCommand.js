/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var _ = require('underscore');

var EmailCommand = Backbone.Model.extend({
  urlRoot: 'admin/commands/email',
  idAttribute: "_id",
  
  defaults: {
    rows: [],
    subject: '',
    message: ''
  },

  validate: function(attrs, options) {
    var errors = {};
    if (! attrs.subject) {
      errors.subject = "can't be blank";
    }
    if (! attrs.message) {
      errors.message = "can't be blank";
    }
    if( ! _.isEmpty(errors)){
      return errors;
    }
  }

});

module.exports = EmailCommand;
