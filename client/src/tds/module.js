/* jshint -W097 */
"use strict";

var BaseModule = require('../common/modules/baseModule');
var messageBus = require('../common/router/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'tds']).join('.');

  var tdsModule = app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      'admin/tds'    : '[' + moduleName + ']list:show',
      'admin/tds/:id': '[' + moduleName + ']edit:show'
    },

    controllers: {
      list: require('./list/controller'),
      edit: require('./edit/controller')
    },

    define: function (tdsModule) {
      tdsModule.renderLayout = function (region) {
        this.region = region;
      };

      tdsModule.getSubModuleRegion = function () {
        return this.region;
      };
    }
  });


  return tdsModule;
};
