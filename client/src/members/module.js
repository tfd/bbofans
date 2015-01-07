/* jshint -W097 */
"use strict";

var BaseModule = require('../common/modules/baseModule');
var messageBus = require('../common/utils/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'members']).join('.');

  var membersModule = app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      'admin/members'    : '[' + moduleName + ']list:show',
      'admin/members/:id': '[' + moduleName + ']edit:show'
    },

    controllers: {
      list: require('./list/controller'),
      edit: require('./edit/controller')
    },

    define: function (membersModule) {
      membersModule.renderLayout = function (region) {
        this.region = region;
      };

      membersModule.getSubModuleRegion = function () {
        return this.region;
      };
    }
  });


  return membersModule;
};
