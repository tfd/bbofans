var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('./layout/controller');
var LoginController = require('./login/controller');
var NavbarController = require('../common/navbar/controller');
var routerFactory = require('../common/utils/router_command_factory');

var adminApp = bbofansApp.module('admin', {
  define: function(adminApp, app, Backbone, Marionette, $, _) {
    var self = this;
    this.app = app;

    adminApp.Router = routerFactory(app, this, 'rbd', {
      "admin": "admin:login:show",
      "admin/login": "admin:login:show"
    });

    app.addInitializer(function () {
      new adminApp.Router();
    });

    this.activate = function () {
      self.layout = new LayoutController({
        app: app,
        region: bbofansApp.content
      });
      self.navbar = new NavbarController({
        app: app,
        region: self.layout.navbar,
        collection: require('./navbar/collection')
      });
      self.login = new LoginController({
        app: app,
        region: self.layout.content
      });

      this.layout.show();
      this.navbar.show();
      this.login.show();
    };
  }
});

module.exports = adminApp;
