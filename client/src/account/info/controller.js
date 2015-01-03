/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/utils/messageBus');

var AdminAccountView = require('./view');
var Account = require('../../models/account');

var AdminAccountInfoController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region, id) {
    var accountToFetch = new Account({ _id : id });
    accountToFetch.fetch().done(function (model) {
      var account = new Account(model);
      var userView = new AdminAccountView({
        model: account
      });

      userView.on('user:edit', function () {
        messageBus.command("route:admin/account/edit/:id", account.get("_id"));
      });
      userView.on('user:password', function () {
        messageBus.command("route:admin/account/password/:id", account.get("_id"));
      });

      region.show(userView);
    });
  }
});

module.exports = AdminAccountInfoController;
