var BaseModule = require('../common/modules/baseModule');
var HomepageLayoutController = require('./layout/controller');
var HomepagePageController = require('./pages/controller');
var HomepageRegisterController = require('./register/controller');
var HomepageTdCarouselController = require('./td_carousel/controller');
var HomepageLoginController = require('./login/controller');

module.exports = function (app) {
  var homepageModule = app.module('homepage', {
    moduleClass: BaseModule,
    routes     : {
      "home"       : "home:show",
      "register"   : "register:show",
      "rules"      : "rules:show",
      "awards"     : "awards:show",
      "matchpoints": "matchpoints:show",
      "bbolinks"   : "bbolinks:show",
      "login"      : "login:show"
    }
  });

  homepageModule.on('start', function () {
    var layout = new HomepageLayoutController({
      app   : app,
      region: app.mainLayout.content
    });
    var page = new HomepagePageController({
      app   : app,
      region: layout.content
    });
    var register = new HomepageRegisterController({
      app   : app,
      region: layout.content
    });
    var login = new HomepageLoginController({
      app   : app,
      region: layout.content
    });
    var carousel = new HomepageTdCarouselController({
      app   : app,
      region: layout.td
    });

    layout.show();
    page.showHome();
    carousel.show();
    app.commands.execute('changeMenu', require('./navbar/collection'));
  });

  return homepageModule;
};
