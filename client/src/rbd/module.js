var BaseModule = require('../common/modules/baseModule');
var RbdLayoutController = require('./layout/controller');
var RbdMembersController = require('./members/controller');
var RbdAwardsController = require('./awards/controller');
var RbdMatchpointsController = require('./matchpoints/controller');

module.exports = function (app) {
  var rbdModule = app.module('rbd', {
        moduleClass: BaseModule,
        routes     : {
          "rbd"            : "rbd:member:show",
          "rbd/members"    : "rbd:member:show",
          "rbd/awards"     : "rbd:awards:show",
          "rbd/matchpoints": "rbd:matchpoints:show"
        }
      }
  );

  rbdModule.on('start', function () {
    var layout = new RbdLayoutController({
      app   : app,
      region: app.mainLayout.content
    });
    var members = new RbdMembersController({
      app   : app,
      region: layout.content
    });
    var awards = new RbdAwardsController({
      app   : app,
      region: layout.content
    });
    var matchpoints = new RbdMatchpointsController({
      app   : app,
      region: layout.content
    });

    layout.show();
    members.show();
    app.commands.execute('changeMenu', require('./navbar/collection'));
  });

  return rbdModule;
};
