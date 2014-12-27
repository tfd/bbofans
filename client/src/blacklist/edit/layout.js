var Marionette = require('backbone.marionette');

var BlacklistEditLayoutView = Marionette.LayoutView.extend({
  template: require('./layout.hbs'),

  regions: {
    'view': '#blacklist-view',
    'form': '#blacklist-form'
  }
});

module.exports = BlacklistEditLayoutView;
