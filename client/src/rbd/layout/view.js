var Marionette = require('backbone.marionette');

var RbdLayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),
  className: 'row',

  regions: {
    'content': '#rbd-content',
    'winners': '#rbd-winners-box'
  }
});

module.exports = RbdLayoutView;
