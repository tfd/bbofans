var Marionette = require('backbone.marionette');
var $ = require('jquery');
var _ = require('underscore');

var HomepageTdCarouselView = Marionette.ItemView.extend({
  model: require('./../../models/tdCarousel'),
  template: require('./template.hbs'),

  onRender: function () {
    var $carousel = $(this.model.get('carouselId'));
    _.delay(function () { $carousel.carousel('cycle'); }, 100);
  }
});

module.exports = HomepageTdCarouselView;
