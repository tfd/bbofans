var Marionette = require('backbone.marionette');
var HomepageLayoutView = require('./view');

var HomepageLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
    this.view = new HomepageLayoutView();
  },

  show: function (region) {
    region.show(this.view);

    this.regions = {
      content: this.view.content,
      td: this.view.td,
      winners: this.view.winners
    };
  },

  onDestroy: function () {
    this.view.destroy();
  }

});

module.exports = HomepageLayoutController;
