var Marionette = require('backbone.marionette');
var bbofansApp = require('../../bbofans');

var CarouselView = require('./view');

var TdCarouselController = Marionette.Controller.extend({
  initialize: function (options) {
    this.view = new CarouselView();
    this.region = options.region;
  },

  show: function () {
    this.region.show(this.view);
  }
});


module.exports = TdCarouselController;
