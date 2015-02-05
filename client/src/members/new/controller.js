/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var NewMemberView = require('./view');
var Member = require('../../models/member');
var messageBus = require('../../common/router/messageBus');
var $ = require('jquery');

var NewMemberControllerImpl = function (options) {
  var self = this;

  function save(model) {
    $.getJSON('/admin/members/bboName/' + model.bboName)
        .done(function (member) {
          messageBus.command('route:admin/members/:id', member._id);
        })
        .fail(function () {
          messageBus.command('route:admin/members/create/:bboName', model.bboName);
        });

    self.app.hidePopup();
  }

  this.show = function (region) {
    var member = new Member();
    this.popupView = new NewMemberView({model: member});
    region.show(this.popupView);
    this.app.showPopup();

    this.popupView.on('form:submit', save);
    this.popupView.on('form:cancel form:close', function () { self.app.hidePopup(); });
  };

  this.app = options.app;
  this.module = options.module;
};

var NewMemberController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new NewMemberControllerImpl(options);
  },

  show: function (region) {
    this.impl.show(region);
  }
});

module.exports = NewMemberController;

