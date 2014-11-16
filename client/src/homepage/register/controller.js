var Marionette = require('backbone.marionette');
var $ = require('jquery');

var RegisterView = require('./view');
var Member = require('../../common/models/member');

var RegisterController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('register:show', function () {
      self.show();
    });
  },

  show: function () {
    var member = new Member();
    var registerView = new RegisterView({
      model: member
    });

    registerView.on('form:submit', function (data) {
      if (!Recaptcha.get_response()) {
        member.validationError = { errors: { 'recaptcha': "can't be blank" } };
        registerView.triggerMethod("form:data:invalid", member.validationError);
      }
      else {
        $.getJSON('/recaptcha/' + Recaptcha.get_challenge() + '/' + Recaptcha.get_response(), function (check) {
          if (!check.passed) {
            member.validationError = { errors: { 'recaptcha': check.error } };
            registerView.triggerMethod("form:data:invalid", member.validationError);
          }
          else if (!member.save(data)) {
            registerView.triggerMethod("form:data:invalid", member.validationError);
          }
          else {
            this.app.trigger("member:show", member.get("id"));
          }
        });
      }

    });

    this.region.show(registerView);
  }
});

module.exports = RegisterController;
