var Marionette = require('backbone.marionette');

var MatchpointsView = Marionette.ItemView.extend({
  template: require('./template.hbs')
});

module.exports = MatchpointsView;
