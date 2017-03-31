/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');

var ResetView = require('./view');
var Password = require('../../models/resetPassword');

var PasswordResetController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region, id, currentPassword) {
    var password = new Password({_id : id, currentPassword: currentPassword});
    var resetView = new ResetView({
      model: password
    });

    resetView.on('form:submit', function (data) {
      var xhr = password.save(data);
      if (xhr === false) {
        resetView.triggerMethod("form:data:invalid", password.validationError);
      }
      else {
        xhr.done(function (data) {
          messageBus.trigger("route:login");
        }).fail(function (xhr) {
          resetView.triggerMethod("form:data:invalid", xhr.responseJSON);
        });
      }
    });

    region.show(resetView);
  }
});

module.exports = PasswordResetController;
