var Marionette = require('backbone.marionette');
var NavbarView = require('./view');

var NavbarController = Marionette.Controller.extend({
  initialize: function (options) {
    this.view = new NavbarView({ collection: options.collection });
    this.region = options.region;
    this.app = options.app;

    this.view.on('navigate', (function (route) {
      options.app.trigger(route);
    }).bind(this));
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = NavbarController;
