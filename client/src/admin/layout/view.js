/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var LayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),
  className: 'row',

  ui: {
    'content': '#admin-content',
    'menu': '#admin-menu-box'
  },

  regions: {
    'content': '@ui.content',
    'menu': '@ui.menu'
  }
});

module.exports = LayoutView;
