var Marionette = require('backbone.marionette');

var MembersView = Marionette.ItemView.extend({
  template: require('./template.hbs')
});

module.exports = MembersView;
