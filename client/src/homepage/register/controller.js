var Marionette = require('backbone.marionette');
var messageBus = require('../../common/utils/messageBus');

var HomepageRegisterView = require('./view');
var Register = require('../../models/register');

var HomepageRegisterController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region) {
    var member = new Register();
    var registerView = new HomepageRegisterView({
      model: member
    });

    registerView.on('form:submit', function (data) {
      if (!Recaptcha.get_response()) {
        registerView.triggerMethod("form:data:invalid", { 'recaptcha': "can't be blank" });
      }
      else {
        var xhr = member.save(data);
        if (xhr === false) {
          registerView.triggerMethod("form:data:invalid", member.validationError);
        }
        else {
          xhr.done(function (data) {
            messageBus.command('log', "done", data);
            messageBus.command("route:member:show", member.get("id"));
          }).fail(function (xhr) {
            messageBus.command('log', "fail", xhr.responseJSON);
            registerView.triggerMethod("form:data:invalid", xhr.responseJSON);
          });
        }
      }
    });

    region.show(registerView);
  }
});

module.exports = HomepageRegisterController;
