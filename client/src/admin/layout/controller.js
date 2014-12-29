var Marionette = require('backbone.marionette');

var AdminLayoutView = require('./view');

var AdminLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;

    this.view = new AdminLayoutView();
  },

  show: function (region) {
    region.show(this.view);

    this.regions = {
      content: this.view.content,
      menu: this.view.menu
    };
  }
});

module.exports = AdminLayoutController;
