var NavbarController = require('./controller');


module.exports = function (app) {
  var navbarModule = app.module('navbar', {
    startWithParent: false,

    onStart: function () {
      this.navbar = new NavbarController({
        app   : app,
        region: app.mainLayout.navbar
      });

      this.navbar.show();
    }
  });

  return navbarModule;
};


