var Marionette = require('backbone.marionette');
var AdminHomeView = require('./view');
var $ = require('jquery');
var messageBus = require('../../common/utils/messageBus');
var authentication = require('../../authentication/controller');

var AdminHomeController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    this.app = options.app;
    this.module = options.module;

    self.view = new AdminHomeView({
      model: authentication.getUser()
    });

    messageBus.comply('admin:logout', function () {
      self.logout();
    });
  },

  logout: function () {
    authentication.logout(function () {
      messageBus.command('route:admin/login');
    });
  },

  show: function (region) {
    region.show(this.view);
  }
});

module.exports = AdminHomeController;
