var BaseModule = require('../common/modules/baseModule');
var RockLayoutController = require('./layout/controller');
var RockMembersController = require('./members/controller');
var RockAwardsController = require('./awards/controller');
var RockMatchpointsController = require('./matchpoints/controller');

module.exports = function (app) {
  var rockModule = app.module('rock', {
    moduleClass: BaseModule,
    routes     : {
      "rock"            : "rock:member:show",
      "rock/members"    : "rock:member:show",
      "rock/awards"     : "rock:awards:show",
      "rock/matchpoints": "rock:matchpoints:show"
    }
  });

  rockModule.on('start', function () {
    var layout = new RockLayoutController({
      app   : app,
      region: app.mainLayout.content
    });
    var members = new RockMembersController({
      app   : app,
      region: layout.content
    });
    var awards = new RockAwardsController({
      app   : app,
      region: layout.content
    });
    var matchpoints = new RockMatchpointsController({
      app   : app,
      region: layout.content
    });

    layout.show();
    members.show();
    app.commands.execute('changeMenu', require('./navbar/collection'));
  });

  return rockModule;
};
