var Marionette = require('backbone.marionette');
var NavbarView = require('./view');

var NavbarController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    this.view = new NavbarView({ collection: options.collection });
    this.region = options.region;
    this.app = options.app;

    this.view.on('navigate', (function (route) {
      self.app.vent.trigger('route:' + route);
    }).bind(this));
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = NavbarController;
