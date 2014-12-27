var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var TdCollection = require('./collection');

var HomepageTdCarousel = Backbone.Model.extend();
var homepageTdCarousel = new HomepageTdCarousel({
  carouselId: 'td-carousel',
  items: new TdCollection()
});

module.exports = homepageTdCarousel;
