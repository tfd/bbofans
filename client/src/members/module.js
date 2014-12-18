var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('../admin/layout/controller');
var MenuController = require('../admin/menu/controller');
var ListController = require('./list/controller');
var EditController = require('./edit/controller');
var NavbarController = require('../common/navbar/controller');
var routerFactory = require('../common/utils/router_command_factory');

var membersApp = bbofansApp.module('members', {
  define: function(membersApp, app, Backbone, Marionette, $, _) {
    var self = this;
    this.app = app;

    membersApp.Router = routerFactory(app, this, 'members', {
      "admin/members": "admin:members:show",
      "admin/members/:id": "admin:members:edit:show"
    });

    app.addInitializer(function () {
      new membersApp.Router();
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

module.exports = membersApp;
