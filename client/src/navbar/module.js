/* jshint -W097 */
"use strict";

var NavbarController = require('./controller');

module.exports = function (app) {
  var navbarModule = app.module('navbar', {
    startWithParent: false,

    define: function (navbarModule, app) {
      this.onStart = function () {
        this.navbar = new NavbarController({
          app: app
        });
      };

      navbarModule.show = function (region) {
        this.navbar.show(region);
      };
    }
  });

  return navbarModule;
};


