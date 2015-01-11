/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var AdminMenuView = require('./view');
var messageBus = require('../../common/router/messageBus');
var authentication = require('../../authentication/controller');

var AdminMenuController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;

    this.view = new AdminMenuView({
      model: authentication.getUser()
    });
    this.view.on('navigate', function (route) {
      if (route.indexOf(':id') > 0) {
        messageBus.command('route:' + route, authentication.getUser().get('_id'));
      }
      else {
        messageBus.command('route:' + route);
      }
    });
  },

  show: function (region) {
    region.show(this.view);
  }
});

module.exports = AdminMenuController;
