var Marionette = require('backbone.marionette');

var RockLayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),
  className: 'row',

  regions: {
    'content': '#rock-content',
    'winners': '#rock-winners-box'
  }
});

module.exports = RockLayoutView;
