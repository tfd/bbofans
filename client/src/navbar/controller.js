/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var NavbarView = require('./view');
var MenuItems = require('./model');
var messageBus = require('../common/router/messageBus');

var NavbarController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    this.app = options.app;
    this.collection = new MenuItems();
    this.view = new NavbarView({ collection: this.collection });

    this.view.on('navigate', function (route) {
      messageBus.command('route:' + route);
    });

    messageBus.comply('navbar:changeMenu', function (menu) {
      self.collection.reset(menu);
    });
  },

  show: function (region) {
    region.show(this.view);
  }
});

module.exports = NavbarController;
