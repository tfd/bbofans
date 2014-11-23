var Marionette = require('backbone.marionette');

var LayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),

  regions: {
    'navbar': '#homepage-navbar',
    'content': '#homepage-content',
    'winners': '#homepage-winners-box'
  }
});

module.exports = LayoutView;
