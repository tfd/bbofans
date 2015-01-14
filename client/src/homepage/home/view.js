/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var HomepageHomeView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),

  ui: {
    'rock'       : '#home-winners-rock',
    'rbd'        : '#home-winners-rbd',
    'tournaments': '#home-tournaments'
  },

  regions: {
    'rock': '@ui.rock',
    'rbd' : '@ui.rbd'
  }
});

module.exports = HomepageHomeView;
