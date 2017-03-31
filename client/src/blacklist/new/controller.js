/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var NewBlacklistView = require('./view');
var DurationEntry = require('../../models/blacklistDurationEntry');
var messageBus = require('../../common/router/messageBus');
var moment = require('moment');

var NewEntryControllerImpl = function (options) {
  var self = this;

  function save(model) {
    var durationEntry = new DurationEntry();
    var xhr = durationEntry.save(model);

    if (xhr === false) {
      self.popupView.triggerMethod("form:data:invalid", durationEntry.validationError);
    }
    else {
      xhr.done(function () {
        messageBus.trigger('blacklist:changed');
      }).fail(function (xhr) {
        messageBus.trigger('log', "fail", xhr.responseJSON);
      });
      self.app.hidePopup();
    }
  }

  this.show = function (region) {
    var durationEntry = new DurationEntry({
      bboName: '',
      from: moment.utc(),
      for: '1M',
      reason: '',
      isNew: true
    });
    this.popupView = new NewBlacklistView({model: durationEntry});
    region.show(this.popupView);
    this.app.showPopup();

    this.popupView.on('form:submit', save);
    this.popupView.on('form:cancel form:close', function () { self.app.hidePopup(); });
  };

  this.app = options.app;
  this.module = options.module;
};

var NewEntryController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new NewEntryControllerImpl(options);
  },

  show: function (region) {
    this.impl.show(region);
  }
});

module.exports = NewEntryController;

