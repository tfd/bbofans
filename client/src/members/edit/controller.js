var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var $ = require('jquery');

var Layout = require('./layout');
var EditMemberView = require('./view');
var BlacklistView = require('../../blacklist/details/view');
var Member = require('../../common/models/member');

var Impl = function(options) {
  var self = this;

  function save(member, data) {
    var xhr = member.save(data);
    if (xhr === false) {
      registerView.triggerMethod("form:data:invalid", member.validationError);
    }
    else {
      xhr.done(function (data) {
        back();
        self.app.vent.trigger('members:changed', data);
      }).fail(function (xhr) {
        console.log("fail", xhr.responseJSON);
        view.triggerMethod("form:data:invalid", xhr.responseJSON);
      });
    }
  }

  function back() {
    var fragment = Backbone.history.fragment;
    var parts = fragment.split('/');
    var route = parts.slice(0, parts.length - 1).join('/');
    self.app.vent.trigger('route:' + route);
  }

  function show(model) {
    var member = new Member(model);

    self.layout = new Layout();
    var memberView = new EditMemberView({
      model: member
    });

    memberView.on('form:submit', function (data) {
      save(member, data);
    });

    memberView.on('form:validate', function (data) {
      data.validatedAt = moment.utc().toISOString();
      save(member, data);
    });

    memberView.on('form:cancel', function () {
      back();
    });

    self.region.show(self.layout);
    self.layout.member.show(memberView);

    var blacklist = new Blacklist({ bboName : member.get('bboName') });
    blacklist.fetchByBboName().done(function (blacklist) {
      if (blacklist) {
        var blacklistView = new BlacklistView({
          model: new Blacklist(blacklist),
          className: 'well'
        });
        self.layout.blacklist.show(blacklistView);
      }
    });
  }
  
  this.region = options.region;
  this.app = options.app;

  this.app.commands.setHandler('admin:members:edit:show', function (id) {
    var member = new Member({ _id : id });
    member.fetch().done(show);
  });
};

var EditMemberController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new Impl(options);
  }
});

module.exports = EditMemberController;
