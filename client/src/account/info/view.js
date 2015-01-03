/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var AccountView = Marionette.ItemView.extend({
  template : require('./template.hbs'),
  className: 'well',

  ui: {
    password: '.button-password',
    edit    : '.button-edit'
  },

  triggers: {
    'click @ui.password': 'user:password',
    'click @ui.edit'    : 'user:edit'
  }
});

module.exports = AccountView;
