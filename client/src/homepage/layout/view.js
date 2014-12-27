var Marionette = require('backbone.marionette');

var HomepageLayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),
  className: 'row',

  regions: {
    'content': '#homepage-content',
    'td': '#homepage-td-box',
    'winners': '#homepage-winners-box'
  }
});

module.exports = HomepageLayoutView;
