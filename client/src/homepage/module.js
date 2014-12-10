var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('./layout/controller');
var PageController = require('./pages/controller');
var RegisterController = require('./register/controller');
var TdCarouselController = require('./td_carousel/controller');
var NavbarController = require('../common/navbar/controller');
var LoginController = require('./login/controller');
var routerFactory = require('../common/utils/router_command_factory');

var homepageApp = bbofansApp.module('homepage', {
  define: function(homepageApp, app, Backbone, Marionette, $, _) {
    var self = this;
    this.app = app;

    homepageApp.Router = routerFactory(app, this, 'homepage', {
      "home": "home:show",
      "register": "register:show",
      "rules": "rules:show",
      "awards": "awards:show",
      "matchpoints": "matchpoints:show",
      "bbolinks": "bbolinks:show",
      "login": "login:show"
    });

    app.addInitializer(function () {
      app.vent.trigger('app:log', 'homepageApp: addInitializer');
      new homepageApp.Router();
    });

    this.activate = function () {
      self.layout = new LayoutController({
        app: app,
        region: app.content
      });
      self.navbar = new NavbarController({
        app: app,
        region: self.layout.navbar,
        collection: require('./navbar/collection')
      });
      self.page = new PageController({
        app: app,
        region: self.layout.content
      });
      self.register = new RegisterController({
        app: app,
        region: self.layout.content
      });
      self.login = new LoginController({
        app: app,
        region: self.layout.content
      });
      self.carousel = new TdCarouselController({
        app: app,
        region: self.layout.td
      });

      this.layout.show();
      this.navbar.show();
      this.page.showHome();
      this.carousel.show();
    };
  }
});

module.exports = homepageApp;
