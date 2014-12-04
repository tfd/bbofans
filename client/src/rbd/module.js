var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('./layout/controller');
var MembersController = require('./members/controller');
var AwardsController = require('./awards/controller');
var MatchpointsController = require('./matchpoints/controller');
var NavbarController = require('../common/navbar/controller');
var routerFactory = require('../common/utils/router_command_factory');

var rbdApp = bbofansApp.module('rbd', {
  define: function(rbdApp, app, Backbone, Marionette, $, _) {
    var self = this;
    this.app = app;

    rbdApp.Router = routerFactory(app, this, 'rbd', {
      "rbd": "rbd:members:show",
      "rbd/members": "rbd:members:show",
      "rbd/awards": "rbd:awards:show",
      "rbd/matchpoints": "rbd:matchpoints:show"
    });

    app.addInitializer(function () {
      new rbdApp.Router();
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
      self.members = new MembersController({
        app: app,
        region: self.layout.content
      });
      self.awards = new AwardsController({
        app: app,
        region: self.layout.content
      });
      self.matchpoints = new MatchpointsController({
        app: app,
        region: self.layout.content
      });

      this.layout.show();
      this.navbar.show();
      this.members.show();
    };
  }
});

module.exports = rbdApp;
