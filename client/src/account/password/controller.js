/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');

var AdminAccountPasswordView = require('./view');
var Password = require('../../models/password');

var AdminAccountPasswordController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region, id) {
    var password = new Password({_id : id});
    var passwordView = new AdminAccountPasswordView({
      model: password
    });

    passwordView.on('form:submit', function (data) {
      var xhr = password.save(data);
      if (xhr === false) {
        passwordView.triggerMethod("form:data:invalid", password.validationError);
      }
      else {
        xhr.done(function (data) {
          messageBus.trigger("route:admin/account/:id", password.get("_id"));
        }).fail(function (xhr) {
          passwordView.triggerMethod("form:data:invalid", xhr.responseJSON);
        });
      }
    });

    region.show(passwordView);
  }
});

module.exports = AdminAccountPasswordController;
