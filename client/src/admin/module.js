var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('./layout/controller');
var MenuController = require('./menu/controller');
var HomeController = require('./home/controller');
var NavbarController = require('../common/navbar/controller');
var routerFactory = require('../common/utils/router_command_factory');

var adminApp = bbofansApp.module('admin', {
  define: function(adminApp, app, Backbone, Marionette, $, _) {
    var self = this;
    this.app = app;

    adminApp.Router = routerFactory(app, this, 'admin', {
      "admin/home": "admin:home:show",
      "admin/members/manage": "admin:members:manage:show"
    });

    app.addInitializer(function () {
      new adminApp.Router();
    });

    this.activate = function () {
      self.layout = new LayoutController({
        app: app,
        region: app.content
      });
      self.menu = new MenuController({
        app: app,
        region: self.layout.menu
      });
      self.navbar = new NavbarController({
        app: app,
        region: self.layout.navbar,
        collection: require('./navbar/collection')
      });
      self.home = new HomeController({
        app: app,
        region: self.layout.content
      });

      this.layout.show();
      this.menu.show();
      this.navbar.show();
    };
  }
});

module.exports = adminApp;
