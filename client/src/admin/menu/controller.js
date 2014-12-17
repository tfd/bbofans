var Marionette = require('backbone.marionette');
var MenuView = require('./view');

var MenuController = Marionette.Controller.extend({
  initialize: function (options) {
    this.view = new MenuView({
      model: options.app.currentUser
    });
    this.region = options.region;
    this.app = options.app;

    this.view.on('navigate', (function (route) {
      options.app.vent.trigger('route:' + route);
    }).bind(this));
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = MenuController;
