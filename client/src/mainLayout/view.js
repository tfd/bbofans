var Marionette = require('backbone.marionette');

var MainLayoutView = Marionette.LayoutView.extend({
  el: '#bbofans-app-container',
  template: require('./template.hbs'),

  regions: {
    'navbar': '#main-navbar',
    'content': '#main-content',
    'popup': '#main-popup'
  }
});

module.exports = MainLayoutView;
