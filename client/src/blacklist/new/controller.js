/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var NewBlacklistView = require('./view');
var DurationEntry = require('../../models/blacklistDurationEntry');
var messageBus = require('../../common/utils/messageBus');
var moment = require('moment');

var NewEntryController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region) {
    var self = this;
    var durationEntry = new DurationEntry({
      bboName: '',
      from: moment.utc(),
      for: '1w',
      reason: ''
    });
    var popupView = new NewBlacklistView({model: durationEntry});
    region.show(popupView);

    this.app.showPopup();

    popupView.on('form:submit', function (data) {
      var xhr = durationEntry.save(data);

      if (xhr === false) {
        messageBus.command('log', "fail", xhr);
        popupView.triggerMethod("form:data:invalid", durationEntry.validationError);
      }
      else {
        xhr.done(function () {
          messageBus.trigger('blacklist:changed');
        }).fail(function (xhr) {
          messageBus.command('log', "fail", xhr.responseJSON);
        });
        self.app.hidePopup();
      }
    });

    popupView.on('form:cancel', function () {
      self.app.hidePopup();
    });
  }
});

module.exports = NewEntryController;

