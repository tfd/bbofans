var Marionette = require('backbone.marionette');

var RockLayoutView = require('./view');

var RockLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.region = options.region;
    this.view = new RockLayoutView();

    this.content = this.view.content;
    this.winners = this.view.winners;
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = RockLayoutController;
