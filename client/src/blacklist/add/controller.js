/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var messageBus = require('../../common/router/messageBus');

var View = require('./view');
var Form = require('../form/view');
var Blacklist = require('../../models/blacklist');
var DurationEntry = require('../../models/blacklistDurationEntry');
var authentication = require('../../authentication/controller');
var routerHistory = require('../../common/router/routerHistory');

var BlacklistAddImpl = function (options) {
  var self = this;

  function save(entry, data) {
    var xhr = entry.save(data);
    if (xhr === false) {
      self.form.triggerMethod("form:data:invalid", entry.validationError);
    }
    else {
      xhr.done(function (data) {
        routerHistory.back();
        messageBus.trigger('blacklist:entry:changed', data);
      }).fail(function (xhr) {
        messageBus.command('log', 'fail', xhr.responseJSON);
        self.form.triggerMethod("form:data:invalid", xhr.responseJSON);
      });
    }
  }

  function show(region, model) {
    var blacklist = new Blacklist(model);
    var durationEntry = new DurationEntry({
      bboName: blacklist.get('bboName'),
      'from': moment.utc().toDate(),
      'for': '1w',
      reason: ''
    });

    self.View = new View({model: durationEntry});

    self.View.on('form:submit', function (data) {
      save(durationEntry, data);
    });

    self.View.on('form:cancel form:close', function () {
      routerHistory.back();
    });

    region.show(self.View);
  }

  this.show = function (region, id) {
    var blacklist = new Blacklist({ _id : id });
    blacklist.fetch().done(function (model) {
      show(region, model);
    });
  };

  this.app = options.app;
  this.model = options.model;
};

var BlacklistAddController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new BlacklistAddImpl(options);
  },

  show: function (region, id) {
    this.impl.show(region, id);
  }
});

module.exports = BlacklistAddController;
