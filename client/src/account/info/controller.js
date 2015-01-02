var Marionette = require('backbone.marionette');
var messageBus = require('../../common/utils/messageBus');

var AdminUserView = require('./view');
var Member = require('../../models/member');

var AdminUserInfoController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region, id) {
    var memberToFetch = new Member({ _id : id });
    memberToFetch.fetch().done(function (model) {
      var member = new Member(model);
      var userView = new AdminUserView({
        model: member
      });

      userView.on('user:edit', function () {
        messageBus.command("route:admin/account/edit/:id", member.get("_id"));
      });
      userView.on('user:password', function () {
        messageBus.command("route:admin/account/password/:id", member.get("_id"));
      });

      region.show(userView);
    });
  }
});

module.exports = AdminUserInfoController;
