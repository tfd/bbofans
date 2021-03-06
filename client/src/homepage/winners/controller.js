/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');

var RockController = require('./rockController');
var RbdController = require('./rbdController');

var WinnersController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;

    this.app = options.app;
    this.module = options.module;

    this.rbd = false;
    this.rockController = new RockController();
    this.rbdController = new RbdController();

    messageBus.on('show:winners:rock', function () {
      self.rbd = false;
      self.rbdController.stop();
      self.rockController.show(self.region);
    });

    messageBus.on('show:winners:rbd', function () {
      self.rbd = true;
      self.rockController.stop();
      self.rbdController.show(self.region);
    });

    messageBus.on('hide:winners', function () {
      self.rbd = false;
      self.rockController.stop();
      self.rbdController.stop();
      self.region.empty();
    });
  },

  show: function (region) {
    this.region = region;

    if (this.rbd) {
      this.rockController.stop();
      this.rbdController.show(region);
    }
    else {
      this.rbdController.stop();
      this.rockController.show(region);
    }
  }
});

module.exports = WinnersController;
