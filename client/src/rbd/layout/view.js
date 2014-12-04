var Marionette = require('backbone.marionette');

var LayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),

  regions: {
    'navbar': '#rbd-navbar',
    'content': '#rbd-content',
    'winners': '#rbd-winners-box'
  }
});

module.exports = LayoutView;
