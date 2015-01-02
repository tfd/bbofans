var BaseModule = require('../common/modules/baseModule');
var messageBus = require('../common/utils/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'account']).join('.');

  return app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      'admin/account/:id'         : '[' + moduleName + ']info:show',
      'admin/account/password/:id': '[' + moduleName + ']password:show',
      'admin/account/edit/:id'    : '[' + moduleName + ']edit:show'
    },

    controllers: {
      info    : require('./info/controller'),
      edit    : require('./edit/controller'),
      password: require('./password/controller')
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
