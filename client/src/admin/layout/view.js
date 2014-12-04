var Marionette = require('backbone.marionette');

var LayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),

  regions: {
    'navbar': '#admin-navbar',
    'content': '#admin-content',
    'menu': '#admin-menu-box'
  }
});

module.exports = LayoutView;
