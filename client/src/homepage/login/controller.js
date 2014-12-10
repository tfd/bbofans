var Marionette = require('backbone.marionette');
var $ = require('jquery');
var LoginView = require('./view');
var User = require('../../common/models/user');

var LoginController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('login:show', function () {
      self.show();
    });
  },

  show: function () {
    var self = this;
    var member = new Member();
    var loginView = new LoginView({});

    loginView.on('form:submit', function (data) {
      $.ajax({
        type: 'POST',
        url: '/admin/session',
        data: data
      }).done(function (rsp) {
        if (rsp.error) {
          loginView.triggerMethod("form:data:invalid", { 'username': "Invalid username or password" });
        }
        else {
          self.app.currentUser = new User(rsp.user);
          self.app.trigger('route:admin/home');
        }
      });
    });

    this.region.show(loginView);
  }
});

module.exports = LoginController;
