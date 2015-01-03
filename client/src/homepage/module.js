/* jshint -W097 */
"use strict";

var BaseModule = require('../common/modules/baseModule');
var messageBus = require('../common/utils/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'homepage']).join('.');

  return app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      "serverError"       : '[' + moduleName + ']pages:showServerError',
      "pageNotFound"      : '[' + moduleName + ']pages:showPageNotFound',
      "home"              : '[' + moduleName + ']pages:showHome',
      "register"          : '[' + moduleName + ']register:show',
      "register/confirmed": '[' + moduleName + ']pages:showConfirmRegistration',
      "register/:id"      : '[' + moduleName + ']register:success',
      "rules"             : '[' + moduleName + ']pages:showRules',
      "awards"            : '[' + moduleName + ']pages:showAwards',
      "matchpoints"       : '[' + moduleName + ']pages:showMatchPoints',
      "bbolinks"          : '[' + moduleName + ']pages:showBboLinks',
      "rbd"               : '[' + moduleName + ']rbd:show',
      "rock"              : '[' + moduleName + ']rock:show',
      "login"             : '[' + moduleName + ']login:show'
    },

    controllers: {
      layout  : require('./layout/controller'),
      pages   : require('./pages/controller'),
      register: require('./register/controller'),
      carousel: require('./td_carousel/controller'),
      rbd     : require('./rbd/controller'),
      rock    : require('./rock/controller'),
      login   : require('./login/controller')
    },

    define: function (homepageModule) {
      homepageModule.renderLayout = function (region) {
        this.region = region;
        this.controllers.layout.show(region);
        this.controllers.carousel.show(this.controllers.layout.regions.td);

        messageBus.command('navbar:changeMenu', require('./navbar/collection'));
      };

      homepageModule.getSubModuleRegion = function () {
        return this.controllers.layout.regions.content;
      };
    }
  });
};
