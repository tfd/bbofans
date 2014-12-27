var Marionette = require('backbone.marionette');

var RbdLayoutView = require('./view');

var RbdLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.region = options.region;
    this.view = new RbdLayoutView();

    this.content = this.view.content;
    this.winners = this.view.winners;
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = RbdLayoutController;
