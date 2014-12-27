var Marionette = require('backbone.marionette');

var MemberCommandsInvalidCommandView = Marionette.ItemView.extend({
  template: require('./invalidCommand.hbs')
});

module.exports = MemberCommandsInvalidCommandView;
