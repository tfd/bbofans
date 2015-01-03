/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/utils/messageBus');

var HomepageRegisterView = require('./view');
var HomepageSuccessView = require('./successView');
var Registrant = require('../../models/registrant');

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
      var xhr = registrant.save(data);
      if (xhr === false) {
        registerView.triggerMethod("form:data:invalid", registrant.validationError);
      }
      else {
        xhr.done(function () {
          messageBus.command("route:register/:id", registrant.get("_id"));
        }).fail(function (xhr) {
          messageBus.command('log', "fail", xhr.responseJSON);
          registerView.triggerMethod("form:data:invalid", xhr.responseJSON);
        });
      }
    });

    region.show(registerView);
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
