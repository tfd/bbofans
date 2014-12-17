var Marionette = require('backbone.marionette');

var NoSelectionView = Marionette.ItemView.extend({
  template: require('./noSelection.hbs')
});

module.exports = NoSelectionView;
