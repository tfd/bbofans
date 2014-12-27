var Marionette = require('backbone.marionette');

var AdminLayoutView = require('./view');

var AdminLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.region = options.region;
    this.view = new AdminLayoutView();

    this.content = this.view.content;
    this.menu = this.view.menu;
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = AdminLayoutController;
