var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('../admin/layout/controller');
var MenuController = require('../admin/menu/controller');
var ListController = require('./list/controller');
var EditController = require('./edit/controller');
var NavbarController = require('../common/navbar/controller');
var routerFactory = require('../common/utils/router_command_factory');

var blacklistApp = bbofansApp.module('blacklist', {
  define: function(blacklistApp, app, Backbone, Marionette, $, _) {
    var self = this;
    this.app = app;

    blacklistApp.Router = routerFactory(app, this, 'blacklist', {
      "admin/blacklist": "admin:blacklist:show",
      "admin/blacklist/:id": "admin:blacklist:edit:show"
    });

    app.addInitializer(function () {
      new blacklistApp.Router();
    });

    this.activate = function () {
      this.layout = new LayoutController({
        app: app,
        region: app.content
      });
      this.menu = new MenuController({
        app: app,
        region: this.layout.menu
      });
      this.navbar = new NavbarController({
        app: app,
        region: this.layout.navbar,
        collection: require('../admin/navbar/collection')
      });
      this.list = new ListController({
        app: app,
        region: this.layout.content,
        popup: app.popup
      });
      this.edit = new EditController({
        app: app,
        region: this.layout.content
      });

      this.layout.show();
      this.menu.show();
      this.navbar.show();
      this.list.show();
    };
  }
});

module.exports = blacklistApp;
