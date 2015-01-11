/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var messageBus = require('../../common/router/messageBus');
var routerHistory = require('../../common/router/routerHistory');

var MemberEditLayout = require('./layout');
var MemberEditView = require('./view');
var MemberEditBlacklistView = require('../../blacklist/details/view');
var Member = require('../../models/member');
var Blacklist = require('../../models/blacklist');

var _ = require('underscore');

var MemberEditImpl = function(options) {
  var self = this;

  function addToArray(data, fieldName) {
    var pluralFieldName = fieldName + 's';
    if (data[fieldName]) {
      var arr = [];
      _.each(data[fieldName], function (val) {
        if (val) {
          arr.push(val);
        }
      });
      if (!_.isEmpty(arr)) {
        data[pluralFieldName] = arr;
      }
      delete data[fieldName];
    }
  }

  function save(member, data) {
    var xhr = member.save(data);
    if (xhr === false) {
      self.view.triggerMethod("form:data:invalid", member.validationError);
    }
    else {
      xhr.done(function (data) {
        routerHistory.back();
        messageBus.trigger('members:changed', data);
      }).fail(function (xhr) {
        messageBus.command('log', "fail", xhr.responseJSON);
        self.view.triggerMethod("form:data:invalid", xhr.responseJSON);
      });
    }
  }

  function show(region, model) {
    var member = new Member(model);

    self.layout = new MemberEditLayout();
    var memberView = new MemberEditView({
      model: member
    });

    memberView.on('form:submit', function (data) {
      addToArray(data, 'email');
      addToArray(data, 'telephone');
      save(member, data);
    });

    memberView.on('form:validate', function (data) {
      data.validatedAt = moment.utc().toISOString();
      save(member, data);
    });

    memberView.on('form:cancel', function () {
      routerHistory.back();
    });

    region.show(self.layout);
    self.layout.member.show(memberView);

    var blacklist = new Blacklist({ bboName : member.get('bboName') });
    blacklist.fetchByBboName().done(function (blacklist) {
      if (blacklist) {
        var blacklistView = new MemberEditBlacklistView({
          model: new Blacklist(blacklist),
          className: 'well'
        });
        self.layout.blacklist.show(blacklistView);
      }
    });
  }

  this.show = function (region, id) {
    var member = new Member({ _id : id });
    member.fetch().done(function (model) {
      show(region, model);
    });
  };
  this.app = options.app;
  this.module = options.module;

};

var MemberEditController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new MemberEditImpl(options);
  },

  show: function (region, id) {
    this.impl.show(region, id);
  }
});

module.exports = MemberEditController;
