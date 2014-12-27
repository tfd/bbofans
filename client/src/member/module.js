var BaseModule = require('../common/modules/baseModule');
var MemberLayoutController = require('../admin/layout/controller');
var MemberMenuController = require('../admin/menu/controller');
var MemberListController = require('./list/controller');
var MemberEditController = require('./edit/controller');

module.exports = function (app) {
  var memberModule = app.module('member', {
    moduleClass: BaseModule,
    routes     : {
      "admin/members"    : "admin:member:show",
      "admin/members/:id": "admin:member:edit:show"
    }
  });

  memberModule.on('start', function () {
    var layout = new MemberLayoutController({
      app   : app,
      region: app.mainLayout.content
    });
    var menu = new MemberMenuController({
      app   : app,
      region: layout.menu
    });
    var list = new MemberListController({
      app   : app,
      region: layout.content,
      popup : app.mainLayout.popup
    });
    var edit = new MemberEditController({
      app   : app,
      region: layout.content
    });

    layout.show();
    menu.show();
    list.show();
    app.commands.execute('changeMenu', require('../admin/navbar/collection'));
  });

  return memberModule;
};
