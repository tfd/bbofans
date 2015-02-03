/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var HomepageHomeView = require('./view');
var messageBus = require('../../common/router/messageBus');
var RockController = require('../winners/rockController');
var RbdController = require('../winners/rbdController');
require('../../models/tournamentCollection');

var HomepageHomeController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region) {
    this.view = new HomepageHomeView({
      collection: messageBus.request('tournaments.tail.10')
    });
    region.show(this.view);

    this.regions = {
      rock: this.view.rock,
      rbd: this.view.rbd
    };

    this.rockController = new RockController();
    this.rbdController = new RbdController();

    this.rockController.show(this.view.rock);
    this.rbdController.show(this.view.rbd);

    messageBus.command('hide:winners');
  },

  onDestroy: function () {
    this.view.destroy();
  }

});

module.exports = HomepageHomeController;
