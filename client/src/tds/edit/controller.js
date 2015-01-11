/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var messageBus = require('../../common/utils/messageBus');
var _ = require('underscore');
var routerHistory = require('../../common/utils/routerHistory');

var TdEditView = require('./view');
var Member = require('../../models/member');

var TdEditImpl = function(options) {
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

    var memberView = new TdEditView({
      model: member
    });

    memberView.on('form:submit', function (data) {
      addToArray(data, 'email');
      addToArray(data, 'telephone');
      save(member, data);
    });

    memberView.on('form:cancel', function () {
      routerHistory.back();
    });

    region.show(memberView);
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

var TdEditController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new TdEditImpl(options);
  },

  show: function (region, id) {
    this.impl.show(region, id);
  }
});

module.exports = TdEditController;
