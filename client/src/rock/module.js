var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('./layout/controller');
var MembersController = require('./members/controller');
var AwardsController = require('./awards/controller');
var MatchpointsController = require('./matchpoints/controller');
var NavbarController = require('../common/navbar/controller');
var routerFactory = require('../common/utils/router_command_factory');

var rockApp = bbofansApp.module('rock', {
  define: function(homepageApp, app, Backbone, Marionette, $, _) {
    var self = this;
    this.app = app;

    homepageApp.Router = routerFactory(app, this, 'rock', {
      "rock": "rock:members:show",
      "rock/members": "rock:members:show",
      "rock/awards": "rock:awards:show",
      "rock/matchpoints": "rock:matchpoints:show"
    });

    app.addInitializer(function () {
      app.vent.trigger('app:log', 'rockApp: addInitializer');
      new homepageApp.Router();
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

module.exports = rockApp;
