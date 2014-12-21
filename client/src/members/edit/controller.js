var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');

var EditMemberView = require('./view');
var Member = require('../../common/models/member');

var EditMemberController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('admin:members:edit:show', function (id) {
      var member = new Member({ _id : id });
      member.fetch().done(self.show.bind(self));
    });
  },

  show: function (model) {
    var self = this;
    var member = new Member(model);
    var view = new EditMemberView({
      model: member
    });

    view.on('form:submit', function (data) {
      self.save(member, data);
    });

    view.on('form:validate', function (data) {
      data.validatedAt = moment.utc().toISOString();
      self.save(member, data);
    });

    view.on('form:cancel', function () {
      self.back();
    });

    self.region.show(view);
  },

  save: function (member, data) {
    var self = this;
    var xhr = member.save(data);
    if (xhr === false) {
      registerView.triggerMethod("form:data:invalid", member.validationError);
    }
    else {
      xhr.done(function (data) {
        self.back();
        self.app.vent.trigger('members:changed', data);
      }).fail(function (xhr) {
        console.log("fail", xhr.responseJSON);
        view.triggerMethod("form:data:invalid", xhr.responseJSON);
      });
    }
  },

  back: function () {
    var fragment = Backbone.history.fragment;
    var parts = fragment.split('/');
    var route = parts.slice(0, parts.length - 1).join('/');
    this.app.vent.trigger('route:' + route);
  }

});

module.exports = EditMemberController;
