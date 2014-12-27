var Marionette = require('backbone.marionette');

var MainLayoutView = require('./view');

var MainLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.view = new MainLayoutView(options);

    this.content = this.view.content;
    this.navbar = this.view.navbar;
    this.popup = this.view.popup;
  },

  show: function () {
    this.view.render();
  }
});

module.exports = MainLayoutController;
