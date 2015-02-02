/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var AdminHomeView = require('./view');
var messageBus = require('../../common/router/messageBus');
var authentication = require('../../authentication/controller');

var AdminHomeController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    this.app = options.app;
    this.module = options.module;

    self.view = new AdminHomeView({
      model: authentication.getUser()
    });

    messageBus.comply('admin:logout', function () {
      self.logout();
    });
  },

  logout: function () {
    authentication.logout(function () {
      messageBus.command('route:login');
    });
  },

  show: function (region) {
    region.show(this.view);
  }
});

module.exports = AdminHomeController;
