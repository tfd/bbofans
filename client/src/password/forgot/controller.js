/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var PasswordForgotView = require('./view');
var ForgotPassword = require('../../models/forgotPassword');
var messageBus = require('../../common/router/messageBus');
var authentication = require('../../authentication/controller');

var PasswordForgotController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;

  },

  show: function (region) {
    var forgotPassword = new ForgotPassword();
    var passwordForgotView = new PasswordForgotView({
      model: forgotPassword
    });

    passwordForgotView.on('form:submit', function (data) {
      var xhr = forgotPassword.save(data);
      if (xhr === false) {
        passwordForgotView.triggerMethod("form:data:invalid", forgotPassword.validationError);
      }
      else {
        xhr.done(function () {
          messageBus.command("route:passwordReset");
        }).fail(function (xhr) {
          messageBus.command('log', "fail", xhr.responseJSON);
          passwordForgotView.triggerMethod("form:data:invalid", xhr.responseJSON);
        });
      }
    });

    region.show(passwordForgotView);

    messageBus.command('show:winners:rock');
  }

});

module.exports = PasswordForgotController;
