var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var bbofansApp = require('../bbofans');
var LayoutController = require('./layout/controller');
var PageController = require('./pages/controller');
var RegisterController = require('./register/controller');
var TdCarouselController = require('./td_carousel/controller');
var NavbarController = require('./navbar/controller');
var routerFactory = require('../common/utils/router_command_factory');

var homepageApp = bbofansApp.module('homepage', {
  define: function(homepageApp, app, Backbone, Marionette, $, _) {

    homepageApp.Router = routerFactory(app, 'homepage', {
      "home": "home:show",
      "register": "register:show",
      "rules": "rules:show",
      "awards": "awards:show",
      "matchpoints": "matchpoints:show",
      "bbolinks": "bbolinks:show"
    });

    app.addInitializer(function () {
      app.vent.trigger('app:log', 'homepageApp: addInitializer');
      new homepageApp.Router();

      var layout = new LayoutController({
        app: app,
        region: bbofansApp.content
      });
      new NavbarController({
        app: app,
        region: layout.navbar
      });
      new PageController({
        app: app,
        region: layout.content
      });
      new RegisterController({
        app: app,
        region: layout.content
      });
      new TdCarouselController({
        app: app,
        region: layout.td
      });
    });
  }
});

module.exports = homepageApp;
