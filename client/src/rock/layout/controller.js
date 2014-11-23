var Marionette = require('backbone.marionette');

var LayoutView = require('./view');

var LayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.region = options.region;
    this.view = new LayoutView();

    this.navbar = this.view.navbar;
    this.content = this.view.content;
    this.winners = this.view.winners;
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = LayoutController;
