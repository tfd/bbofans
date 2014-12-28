var Marionette = require('backbone.marionette');

var MainLayoutView = Marionette.LayoutView.extend({
  el: '#bbofans-app-container',
  template: require('./template.hbs'),

  ui: {
    'navbar': '#main-navbar',
    'content': '#main-content',
    'popup': '#main-popup'
  },

  regions: {
    'navbar': '@ui.navbar',
    'content': '@ui.content',
    'popup': '@ui.popup'
  }
});

module.exports = MainLayoutView;
