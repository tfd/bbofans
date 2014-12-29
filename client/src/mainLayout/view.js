var Marionette = require('backbone.marionette');

var MainLayoutView = Marionette.LayoutView.extend({
  el      : '#bbofans-app-container',
  template: require('./template.hbs'),

  ui: {
    'navbar' : '#main-navbar',
    'content': '#main-content',
    'popup'  : '#main-popup',
    'modal'  : '#popupModal'
  },

  regions: {
    'navbar' : '@ui.navbar',
    'content': '@ui.content',
    'popup'  : '@ui.popup',
    'modal'  : '@ui.modal'
  }
});

module.exports = MainLayoutView;
