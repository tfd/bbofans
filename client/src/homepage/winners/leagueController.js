/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var moment = require('moment');
var _ = require('underscore');

var LeagueController = Marionette.Controller.extend({
  initialize: function (options) {
    options = options || {};
    this.month = _.isNumber(options.month) && !_.isNaN(options.month) ? options.month : moment().month();
    this.year = _.isNumber(options.year) && !_.isNaN(options.year) ? options.year : moment().year();
  },

  show: function (region) {
    var self = this;
    this.winners = new this.Collection();
    this.stopped = false;

    this.winners.fetch({data: {month: this.month, year: this.year}, reset: true}).done(function () {
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
