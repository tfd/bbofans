var Marionette = require('backbone.marionette');

var LayoutView = Marionette.LayoutView.extend({
  template: require('./layout.hbs'),

  regions: {
    'view': '#blacklist-view',
    'form': '#blacklist-form'
  }
});

module.exports = LayoutView;
