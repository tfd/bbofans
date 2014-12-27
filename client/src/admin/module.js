var BaseModule = require('../common/modules/baseModule');
var AdminLayoutController = require('./layout/controller');
var AdminMenuController = require('./menu/controller');
var AdminHomeController = require('./home/controller');

module.exports = function (app) {
  var adminModule = app.module('admin', {
    moduleClass: BaseModule,
    routes     : {
      "admin"     : "admin:home:show",
      "admin/home": "admin:home:show"
    }
  });

  adminModule.on('start', function () {
    var layout = new AdminLayoutController({
      app   : app,
      region: app.mainLayout.content
    });
    var menu = new AdminMenuController({
      app   : app,
      region: layout.menu
    });

    var home = new AdminHomeController({
      app   : app,
      region: layout.content
    });

    layout.show();
    menu.show();
    app.commands.execute('changeMenu', require('./navbar/collection'));
  });

  return adminModule;
};
