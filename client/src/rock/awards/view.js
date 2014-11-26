var Marionette = require('backbone.marionette');

var AwardsView = Marionette.ItemView.extend({
  template: require('./template.hbs')
});

module.exports = AwardsView;
