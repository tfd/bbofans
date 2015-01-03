/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var RockMembersView = require('./view');
var Member = require('../../models/member');

var RockMembersController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region) {
    var member = new Member();
    var view = new RockMembersView({
      model: member
    });

    region.show(view);
  }
});

module.exports = RockMembersController;
