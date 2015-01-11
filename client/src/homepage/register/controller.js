/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');

var HomepageRegisterView = require('./view');
var HomepageSuccessView = require('./successView');
var Registrant = require('../../models/registrant');

function convertArrayErrorToFieldError(errors) {
  if (errors.emails) {
    errors.email = errors.emails;
    delete errors.emails;
  }
  if (errors.telephones) {
    errors.telephone = errors.telephones;
    delete errors.telephones;
  }
}

var HomepageRegisterController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region) {
    var registrant = new Registrant();
    var registerView = new HomepageRegisterView({
      model: registrant
    });

    registerView.on('form:submit', function (data) {
      // Convert telephones and emails to array.
      data.emails = [data.email];
      data.telephones = [data.telephone];
      delete data.email;
      delete data.telephone;

      var xhr = registrant.save(data);
      if (xhr === false) {
        convertArrayErrorToFieldError(registrant.validationError);
        registerView.triggerMethod("form:data:invalid", registrant.validationError);
      }
      else {
        xhr.done(function () {
          messageBus.command("route:register/:id", registrant.get("_id"));
        }).fail(function (xhr) {
          messageBus.command('log', "fail", xhr.responseJSON);
          convertArrayErrorToFieldError(xhr.responseJSON);
          registerView.triggerMethod("form:data:invalid", xhr.responseJSON);
        });
      }
    });

    region.show(registerView);

    messageBus.command('show:winners:rock');
  },

  success: function (region, id) {
    var registrantToFetch = new Registrant({_id: id});
    registrantToFetch.fetch().done(function (model) {
      var registrant = new Registrant(model);
      var successView = new HomepageSuccessView({
        model: registrant
      });

      region.show(successView);
    });
  }
});

module.exports = HomepageRegisterController;
