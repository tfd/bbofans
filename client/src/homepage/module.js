var BaseModule = require('../common/modules/baseModule');
var controllerFactories = {
  layout  : require('./layout/controller'),
  pages   : require('./pages/controller'),
  register: require('./register/controller'),
  carousel: require('./td_carousel/controller'),
  rbd     : require('./rbd/controller'),
  rock    : require('./rock/controller'),
  login   : require('./login/controller')
};
var messageBus = require('../common/utils/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'homepage']).join('.');

  var homepageModule = app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      "home"       : '[' + moduleName + ']home:show',
      "register"   : '[' + moduleName + ']register:show',
      "rules"      : '[' + moduleName + ']pages:showRules',
      "awards"     : '[' + moduleName + ']pages:showAwards',
      "matchpoints": '[' + moduleName + ']pages:showMatchPoints',
      "bbolinks"   : '[' + moduleName + ']pages:showBboLinks',
      "rbd"        : '[' + moduleName + ']rbd:show',
      "rock"       : '[' + moduleName + ']rock:show',
      "login"      : '[' + moduleName + ']login:show'
    },

    onRenderLayout: function (region) {
      this.region = region;
      this.controllers.layout.show(region);
      this.controllers.carousel.show(this.layout.regions.td);

      messageBus.command('navbar:changeMenu', require('./navbar/collection'));
    },

    getSubModuleRegion: function () {
      return this.controllers.layout.region.content;
    }
  });

  homepageModule.on('start', function () {
    var self = this;
    _.each(controllerFactories, function (Value, key) {
      this.controllers[key] = new Value({
        app   : app,
        module: self
      });
    });
  });

  return homepageModule;
};
