var Marionette = require('backbone.marionette');

var MemberCommandsNoSelectionView = Marionette.ItemView.extend({
  template: require('./noSelection.hbs')
});

module.exports = MemberCommandsNoSelectionView;
