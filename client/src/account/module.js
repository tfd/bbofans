var BaseModule = require('../common/modules/baseModule');
var controllerFactories = {
  info    : require('./info/controller'),
  edit    : require('./edit/controller'),
  password: require('./password/controller')
};
var messageBus = require('../common/utils/messageBus');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'account']).join('.');

  return app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      'admin/user/:id'         : '[' + moduleName + ']info:show',
      'admin/user/password/:id': '[' + moduleName + ']password:show',
      'admin/user/edit/:id'    : '[' + moduleName + ']edit:show'
    },

    define: function (accountModule) {
      accountModule.renderLayout = function (region) {
        this.region = region;
      };

      accountModule.getSubModuleRegion = function () {
        return this.region;
      };

      accountModule.on('start', function () {
        var self = this;
        _.each(controllerFactories, function (Value, key) {
          self.controllers[key] = new Value({
            app   : app,
            module: self
          });
        });
      });
    }
  });
};
