/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var AdminHomeView = Marionette.ItemView.extend({
  template: require('./template.hbs')
});

module.exports = AdminHomeView;
