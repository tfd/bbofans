var Marionette = require('backbone.marionette');

var HomepageTdCarouselView = Marionette.ItemView.extend({
  model: require('./model'),
  template: require('./template.hbs')
});

module.exports = HomepageTdCarouselView;
