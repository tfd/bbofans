/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var BlacklistDetailsEntryView = Marionette.ItemView.extend({
  template: require('./entry.hbs'),
  tagName: 'div',
  className: 'panel panel-default'
});

module.exports = BlacklistDetailsEntryView;
