var Marionette = require('backbone.marionette');

var LayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),

  regions: {
    'navbar': '#rock-navbar',
    'content': '#rock-content',
    'winners': '#rock-winners-box'
  }
});

module.exports = LayoutView;
