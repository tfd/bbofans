var BaseModule = require('../common/modules/baseModule');
var messageBus = require('../common/utils/messageBus');
var _ = require('underscore');
var controllerFactories = {
  list: require('./list/controller'),
  edit: require('./edit/controller')
};

module.exports = function (app, parentModuleName) {
  var moduleName = _.compact([parentModuleName, 'blacklist']).join('.');

  var blacklistModule = app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: BaseModule,

    routes: {
      "admin/blacklist"    : '[' + moduleName + ']list:show',
      "admin/blacklist/:id": '[' + moduleName + ']edit:show'
    },

    renderLayout: function (region) {
      this.region = region;
    },

    getSubModuleRegion: function () {
      return this.region;
    }
  });

  blacklistModule.on('start', function () {
    var self = this;
    _.each(controllerFactories, function (Value, key) {
      this.controllers[key] = new Value({
        app   : app,
        module: self
      });
    });
  });

  return blacklistModule;
};
