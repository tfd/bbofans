var Marionette = require('backbone.marionette');
var AdminMenuView = require('./view');

var AdminMenuController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;

    this.view = new AdminMenuView({
      model: options.app.currentUser
    });
    this.region = options.region;
    this.app = options.app;

    this.view.on('navigate', function (route) {
      self.app.vent.trigger('route:' + route);
    });
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = AdminMenuController;
