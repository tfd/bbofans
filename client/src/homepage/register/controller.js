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
    var self = this;
    var member = new Member();
    var registerView = new RegisterView({
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
            console.log("done", data);
            self.app.trigger("member:show", member.get("id"));
          }).fail(function (xhr) {
            console.log("fail", xhr.responseJSON);
            registerView.triggerMethod("form:data:invalid", xhr.responseJSON);
          });
        }
      }
    });

    this.region.show(registerView);
  }
});

module.exports = RegisterController;
