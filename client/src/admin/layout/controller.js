var Marionette = require('backbone.marionette');

var AdminLayoutView = require('./view');

var AdminLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;

    this.view = new AdminLayoutView();

    this.regions = {
      content: this.view.content,
      menu: this.view.menu
    };
  },

  show: function (region) {
    region.show(this.view);
  }
});

module.exports = AdminLayoutController;
