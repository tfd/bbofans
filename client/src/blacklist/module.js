var BaseModule = require('../common/modules/baseModule');
var BlacklistLayoutController = require('../admin/layout/controller');
var BlacklistMenuController = require('../admin/menu/controller');
var BlacklistListController = require('./list/controller');
var BlacklistEditController = require('./edit/controller');

module.exports = function (app) {
  var blacklistModule = app.module('blacklist', {
    moduleClass: BaseModule,
    routes     : {
      "admin/blacklist"    : "admin:blacklist:show",
      "admin/blacklist/:id": "admin:blacklist:edit:show"
    }
  });

  blacklistModule.on('start', function () {
    var layout = new BlacklistLayoutController({
      app   : app,
      region: app.mainLayout.content
    });
    var menu = new BlacklistMenuController({
      app   : app,
      region: layout.menu
    });
    var list = new BlacklistListController({
      app   : app,
      region: layout.content,
      popup : app.mainLayout.popup
    });
    var edit = new BlacklistEditController({
      app   : app,
      region: layout.content
    });

    layout.show();
    menu.show();
    list.show();
    app.commands.execute('changeMenu', require('../admin/navbar/collection'));
  });

  return blacklistModule;
};
