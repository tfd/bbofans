/* jshint -W097 */
"use strict";

var BaseModule = require('../common/modules/baseModule');
var messageBus = require('../common/router/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'homepage']).join('.');

  return app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      "serverError"       : '[' + moduleName + ']pages:showServerError',
      "pageNotFound"      : '[' + moduleName + ']pages:showPageNotFound',
      "home"              : '[' + moduleName + ']home:show',
      // "register"          : '[' + moduleName + ']register:show',
      // "register/confirmed": '[' + moduleName + ']pages:showConfirmRegistration',
      // "register/:id"      : '[' + moduleName + ']register:success',
      // "about"             : '[' + moduleName + ']pages:showAbout',
      // "rules"             : '[' + moduleName + ']pages:showRules',
      // "awards"            : '[' + moduleName + ']pages:showAwards',
      // "matchpoints"       : '[' + moduleName + ']pages:showMatchPoints',
      "bbolinks"          : '[' + moduleName + ']pages:showBboLinks',
      // "passwordReset"     : '[' + moduleName + ']pages:showPasswordReset',
      // "rbd"               : '[' + moduleName + ']rbd:show',
      // "rock"              : '[' + moduleName + ']rock:show' // ,
      // "login"             : '[' + moduleName + ']login:show'
    },

    controllers: {
      layout  : require('./layout/controller'),
      home    : require('./home/controller'),
      pages   : require('./pages/controller'),
      // register: require('./register/controller'),
      // carousel: require('./td_carousel/controller'),
      // rbd     : require('./rbd/controller'),
      // rock    : require('./rock/controller'),
      // login   : require('./login/controller'),
      // winners : require('./winners/controller')
    },

    define: function (homepageModule) {
      homepageModule.renderLayout = function (region) {
        this.region = region;
        this.controllers.layout.show(region);
        this.controllers.carousel.show(this.controllers.layout.regions.td);
        // this.controllers.winners.show(this.controllers.layout.regions.winners);

        messageBus.trigger('navbar:changeMenu', require('./navbar/collection'));
      };

      homepageModule.getSubModuleRegion = function () {
        return this.controllers.layout.regions.content;
      };
    }
  });
};
