var Marionette = require('backbone.marionette');

var NavbarView = require('./view');

var NavbarController = Marionette.Controller.extend({
  initialize: function (options) {
    var navBarView = new NavbarView();
    options.region.show(navBarView);

    navBarView.on('navigate', function (route) {
      options.app.trigger(route);
    });
  }
});

module.exports = NavbarController;
