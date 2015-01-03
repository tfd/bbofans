/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var HomepageLoginView = require('./view');
var User = require('../../models/user');
var messageBus = require('../../common/utils/messageBus');
var authentication = require('../../authentication/controller');

var HomepageLoginController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;

  },

  show: function (region) {
    var loginView = new HomepageLoginView({});

    authentication.isAuthenticated(function (auth) {
      if (auth) {
        // User already logged in, bring him to the menu.
        messageBus.command('route:admin/home');
        return;
      }

      loginView.on('form:submit', function (data) {
        authentication.login(data.username, data.password, function (err) {
          if (err) {
            loginView.triggerMethod("form:data:invalid", err);
          }
          else {
            messageBus.command('route:admin/home');
          }
        });
      });
      region.show(loginView);
    });
  }

});

module.exports = HomepageLoginController;
