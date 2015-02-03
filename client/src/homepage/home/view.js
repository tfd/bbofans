/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var $ = require('jquery');

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
  },

  initialize: function() {
    this.listenTo(this.collection, "change reset add", this.collectionChanged);
  },

  collectionChanged: function () {
    this.render();
  }
});

module.exports = HomepageHomeView;
