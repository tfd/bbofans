var Marionette = require('backbone.marionette');

var HomeView = Backbone.Marionette.ItemView.extend({
  template: require('./template.hbs'),
});

module.exports = HomeView;
