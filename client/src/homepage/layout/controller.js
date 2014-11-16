var Marionette = require('backbone.marionette');

var LayoutView = require('./view');

var TdCarouselController = Marionette.Controller.extend({
  initialize: function (options) {
    var layoutView = new LayoutView();
    options.region.show(layoutView);

    this.navbar = layoutView.navbar;
    this.content = layoutView.content;
    this.td = layoutView.td;
    this.winners = layoutView.winners;
  }
});

module.exports = TdCarouselController;
