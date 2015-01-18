/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var HomepageHomeView = require('./view');
var messageBus = require('../../common/router/messageBus');

var HomepageHomeController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
    this.view = new HomepageHomeView({
      collection: messageBus.request('tournaments:tail:10')
    });
  },

  show: function (region) {
    region.show(this.view);

    this.regions = {
      rock: this.view.rock,
      rbd: this.view.rbd
    };
  },

  onDestroy: function () {
    this.view.destroy();
  }

});

module.exports = HomepageHomeController;
