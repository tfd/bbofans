var Marionette = require('backbone.marionette');
var $ = require('jquery');
var HomepageLayoutView = require('./view');

var HomepageLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.region = options.region;
    this.view = new HomepageLayoutView();

    this.content = this.view.content;
    this.td = this.view.td;
    this.winners = this.view.winners;
  },

  show: function () {
    this.region.show(this.view);
  }
});

module.exports = HomepageLayoutController;
