var AuthenticatedModule = require('../common/modules/authenticatedModule');
var messageBus = require('../common/utils/messageBus');
var authentication = require('../authentication/controller');
var _ = require('underscore');

module.exports = function (app, parentModuleName) {

  var moduleName = _.compact([parentModuleName, 'admin']).join('.');

  return app.module(moduleName, {
    moduleName : moduleName,
    moduleClass: AuthenticatedModule,

    routes: {
      "admin"     : '[' + moduleName + ']home:show',
      "admin/home": '[' + moduleName + ']home:show'
    },

    controllers: {
      layout: require('./layout/controller'),
      menu  : require('./menu/controller'),
      home  : require('./home/controller')
    },

    define: function (adminModule) {
      adminModule.renderLayout = function (region) {
        this.controllers.layout.show(region);
        this.controllers.menu.show(this.controllers.layout.regions.menu);

        messageBus.command('navbar:changeMenu', require('./navbar/collection'));
      };

      adminModule.getSubModuleRegion = function () {
        return this.controllers.layout.regions.content;
      };
    }
  });
};
