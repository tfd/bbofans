var Marionette = require('backbone.marionette');
var messageBus = require('../../common/utils/messageBus');

var AdminUserEditView = require('./view');
var Member = require('../../models/member');

var AdminUserEditController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region, id) {
    var memberToFetch = new Member({_id: id});
    memberToFetch.fetch().done(function (model) {
      var member = new Member(model);
      var editView = new AdminUserEditView({
        model: member
      });

      editView.on('form:submit', function (data) {
        var xhr = member.save(data);
        if (xhr === false) {
          editView.triggerMethod("form:data:invalid", member.validationError);
        }
        else {
          xhr.done(function (data) {
            messageBus.command('log', "done", data);
            messageBus.command("route:admin/account/:id", member.get("_id"));
          }).fail(function (xhr) {
            messageBus.command('log', "fail", xhr.responseJSON);
            editView.triggerMethod("form:data:invalid", xhr.responseJSON);
          });
        }
      });

      editView.on('form:cancel', function () {
        messageBus.command("route:admin/account/:id", member.get("_id"));
      });

      region.show(editView);
    });
  }
});

module.exports = AdminUserEditController;
