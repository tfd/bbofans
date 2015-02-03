/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var LeagueController = Marionette.Controller.extend({
  show: function (region) {
    var self = this;
    this.winners = new this.Collection();
    this.stopped = false;

    this.winners.fetch().done(function () {
      if (!self.stopped) {
        var view = new self.View({collection: self.winners});
        region.show(view);
      }
    });
  },

  stop: function () {
    this.stopped = true;
  }
});

module.exports = LeagueController;
