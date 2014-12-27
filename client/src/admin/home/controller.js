var Marionette = require('backbone.marionette');
var AdminHomeView = require('./view');
var $ = require('jquery');

var AdminHomeController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('admin:home:show', function () {
      self.show();
    });

    this.app.commands.setHandler('admin:logout', function () {
      $.ajax({url: '/admin/logout'}).complete(function () {
        self.app.vent.trigger('route:admin/login');
      });
    });
  },

  show: function () {
    var self = this;
    var view = new AdminHomeView({
      model: self.app.currentUser
    });

    this.region.show(view);
  }
});

module.exports = AdminHomeController;
