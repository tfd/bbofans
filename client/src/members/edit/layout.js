var Marionette = require('backbone.marionette');

var LayoutView = Marionette.LayoutView.extend({
  template: require('./layout.hbs'),

  regions: {
    'member': '#member-edit',
    'blacklist': '#blacklist-edit'
  }
});

module.exports = LayoutView;
