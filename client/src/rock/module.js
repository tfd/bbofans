var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('./layout/controller');
var MembersController = require('./members/controller');
var AwardsController = require('./awards/controller');
var MatchpointsController = require('./matchpoints/controller');
var NavbarController = require('../common/controllers/navbar');
var routerFactory = require('../common/utils/router_command_factory');

var homepageApp = bbofansApp.module('homepage', {
  define: function(homepageApp, app, Backbone, Marionette, $, _) {
    var self = this;
    this.app = app;

    homepageApp.Router = routerFactory(app, this, 'rock', {
      "rock": "members:show",
      "rock/members": "members:show",
      "rock/awards": "awards:show",
      "rock/matchpoints": "matchpoints:show"
    });

    app.addInitializer(function () {
      app.vent.trigger('app:log', 'homepageApp: addInitializer');
      new homepageApp.Router();

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
        region: self.layout.td
      });
    });

    this.activate = function () {
      this.layout.show();
      this.navbar.show();
      this.members.show();
    };
  }
});

module.exports = homepageApp;
