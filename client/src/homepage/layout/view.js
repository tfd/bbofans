var Marionette = require('backbone.marionette');

var HomepageLayoutView = Marionette.LayoutView.extend({
  template : require('./template.hbs'),
  className: 'row',

  ui: {
    'content': '#homepage-content',
    'td'     : '#homepage-td-box',
    'winners': '#homepage-winners-box'
  },

  regions: {
    'content': '@ui.content',
    'td'     : '@ui.td',
    'winners': '@ui.winners'
  }
});

module.exports = HomepageLayoutView;
