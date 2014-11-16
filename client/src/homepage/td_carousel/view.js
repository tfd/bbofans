var Marionette = require('backbone.marionette');

var TdCarouselView = Marionette.ItemView.extend({
  model: require('./collection'),
  template: require('./template.hbs')
});

module.exports = TdCarouselView;
