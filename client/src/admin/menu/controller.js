var Marionette = require('backbone.marionette');
var AdminMenuView = require('./view');
var messageBus = require('../../common/utils/messageBus');
var authentication = require('../../authentication/controller');

var AdminMenuController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;

    this.view = new AdminMenuView({
      model: authentication.getUser()
    });
    this.view.on('navigate', function (route) {
      messageBus.command('route:' + route);
    });
  },

  show: function (region) {
    region.show(this.view);
  }
});

module.exports = AdminMenuController;
