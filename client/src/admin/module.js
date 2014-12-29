var AuthenticatedModule = require('../common/modules/authenticatedModule');
var controllerFactories = {
  layout: require('./layout/controller'),
  menu  : require('./menu/controller'),
  home  : require('./home/controller')
};
var messageBus = require('../common/utils/messageBus');
var authentication = require('../authentication/controller');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {

  var moduleName = _.compact([parentModuleName, 'admin']).join('.');

  var adminModule = app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: AuthenticatedModule,

    routes: {
      "admin"     : '[' + moduleName + ']home:show',
      "admin/home": '[' + moduleName + ']home:show'
    },

    define: function (adminModule, app) {
      adminModule.renderLayout = function (region) {
        this.controllers.layout.show(region);
        this.controllers.menu.show(this.controllers.layout.regions.menu);

        messageBus.command('navbar:changeMenu', require('./navbar/collection'));
      };

      adminModule.getSubModuleRegion = function () {
        return this.controllers.layout.regions.content;
      };

      adminModule.on('start', function () {
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

  return adminModule;
}
;
