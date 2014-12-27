var Marionette = require('backbone.marionette');

var LayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),
  className: 'row',

  regions: {
    'content': '#admin-content',
    'menu': '#admin-menu-box'
  }
});

module.exports = LayoutView;
