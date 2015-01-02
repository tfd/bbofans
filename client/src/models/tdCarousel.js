var Backbone = require('backbone');
var TdCollection = require('./tdCarouselCollection');

var HomepageTdCarousel = Backbone.Model.extend();
var homepageTdCarousel = new HomepageTdCarousel({
  carouselId: 'td-carousel',
  items: new TdCollection()
});

module.exports = homepageTdCarousel;
