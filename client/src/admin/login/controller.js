var Marionette = require('backbone.marionette');
var $ = require('jquery');

var LoginView = require('./view');

var LoginController = Marionette.Controller.extend({
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
    var loginView = new LoginView({
      model: member
    });

    loginView.on('form:submit', function (data) {
      var xhr = member.save(data);
      if (xhr === false) {
        loginView.triggerMethod("form:data:invalid", member.validationError);
      }
      else {
        xhr.done(function (data) {
          console.log("done", data);
          self.app.trigger("member:show", member.get("id"));
        }).fail(function (xhr) {
          console.log("fail", xhr.responseJSON);
          loginView.triggerMethod("form:data:invalid", xhr.responseJSON);
        });
      }
    });

    this.region.show(loginView);
  }
});

module.exports = LoginController;
