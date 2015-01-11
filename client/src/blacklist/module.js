/* jshint -W097 */
"use strict";

var BaseModule = require('../common/modules/baseModule');
var messageBus = require('../common/router/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'blacklist']).join('.');

  return app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      "admin/blacklist"    : '[' + moduleName + ']list:show',
      "admin/blacklist/:id": '[' + moduleName + ']edit:show'
    },

    controllers: {
      list: require('./list/controller'),
      edit: require('./edit/controller')
    },

    define: function (blacklistModule) {
      blacklistModule.renderLayout = function (region) {
        this.region = region;
      };

      blacklistModule.getSubModuleRegion = function () {
        return this.region;
      };
    }
  });
};
