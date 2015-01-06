/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/utils/messageBus');

var RockWinners = require('../../models/rockWinners');
var RbdWinners = require('../../models/rbdWinners');
var RockView = require('./rockView');
var RbdView = require('./rbdView');

var WinnersController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;

    this.app = options.app;
    this.module = options.module;
    this.rbd = false;

    messageBus.comply('show:winners:rbd', function () {
      self.rbd = true;
      self.load();
    });

    messageBus.comply('show:winners:rock', function () {
      self.rbd = false;
      self.load();
    });
  },

  load: function () {
    if (this.view) {
      var self = this;
      var rbd = this.rbd;
      var winners = rbd ? new RbdWinners() : new RockWinners();
      var View = rbd ? RbdView : RockView;

      winners.fetch().done(function () {
        if (rbd !== self.rbd) {
          // Somebody changed page in the meantime.
          self.load();
        }
        else {
          self.view = new View({collection: winners});
          self.region.show(self.view);
        }
      });
    }
  },

  show: function (region) {
    this.region = region;

    var self = this;
    var rbd = this.rbd;
    var winners = rbd ? new RbdWinners() : new RockWinners();
    var View = rbd ? RbdView : RockView;

    winners.fetch().done(function () {
      if (rbd !== self.rbd) {
        // Somebody changed page in the meantime.
        self.show(region);
      }
      else {
        self.view = new View({collection: winners});
        region.show(self.view);
      }
    });
  }
});

module.exports = WinnersController;
