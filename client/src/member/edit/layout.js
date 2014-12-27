var Marionette = require('backbone.marionette');

var MemberEditLayoutView = Marionette.LayoutView.extend({
  template: require('./layout.hbs'),

  regions: {
    'member': '#member-edit',
    'blacklist': '#blacklist-edit'
  }
});

module.exports = MemberEditLayoutView;
