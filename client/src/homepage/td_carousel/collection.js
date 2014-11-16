var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../../bbofans');
require('./model');

var TdCarousel = Backbone.Model.extend();
var tdCarousel = new TdCarousel({
  carouselId: 'td-carousel',
  items: bbofansApp.reqres.request('td:getPictures')
});

module.exports = tdCarousel;
