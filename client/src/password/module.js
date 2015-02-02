/* jshint -W097 */
"use strict";

var BaseModule = require('../common/modules/baseModule');
var messageBus = require('../common/router/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'password']).join('.');

  return app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      "password/forgot"             : '[' + moduleName + ']forgotPassword:show',
      "password/reset/:id/:password": '[' + moduleName + ']resetPassword:show'
    },

    controllers: {
      forgotPassword: require('./forgot/controller'),
      resetPassword : require('./reset/controller')
    },

    define: function (accountModule) {
      accountModule.renderLayout = function (region) {
        this.region = region;
      };

      accountModule.getSubModuleRegion = function () {
        return this.region;
      };
    }
  });
};
