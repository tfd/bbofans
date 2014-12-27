var Marionette = require('backbone.marionette');
var NavbarView = require('./view');
var MenuItems = require('./model');

var NavbarController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    this.app = options.app;
    this.region = options.region;
    this.collection = new MenuItems();
    this.view = new NavbarView({ collection: this.collection });

    this.view.on('navigate', function (route) {
      self.app.vent.trigger('route:' + route);
    });

    this.app.commands.setHandler('changeMenu', function (menu) {
      self.collection.reset(menu);
    });
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = NavbarController;
