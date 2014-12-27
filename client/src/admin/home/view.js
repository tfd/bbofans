var Marionette = require('backbone.marionette');

var AdminHomeView = Backbone.Marionette.ItemView.extend({
  template: require('./template.hbs')
});

module.exports = AdminHomeView;
