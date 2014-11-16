var Marionette = require('backbone.marionette');
var bbofansApp = require('../../bbofans');

var CarouselView = require('./view');

var TdCarouselController = Marionette.Controller.extend({
  initialize: function (options) {
    var carouselView = new CarouselView();
    options.region.show(carouselView);
  },
});


module.exports = TdCarouselController;
