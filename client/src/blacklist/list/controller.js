/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var BlacklistListView = require('./view');
var NewBlacklistController = require('../new/controller');
var Member = require('../../models/member');
var messageBus = require('../../common/router/messageBus');
var _ = require('underscore');

var MembersController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show         : function (region) {
    var self = this;

    var member = new Member();
    this.view = new BlacklistListView({
      model: member
    });

    this.view.on('blacklist:edit', _.bind(this.editBlacklist, this));
    this.view.on('blacklist:new', _.bind(this.newBlacklist, this));

    messageBus.on('blacklist:changed', function () {
      self.view.reloadTable();
    });

    region.show(this.view);
  },

  /*
   * User wants to add a new member.
   *
   * This is done with a popup window.
   */
  newBlacklist : function () {
    var newBlacklistController = new NewBlacklistController({
      app   : this.app,
      module: this.module
    });

    newBlacklistController.show(this.app.getPopupRegion());
  },

  /*
   * User wants to edit a member.
   *
   * This is done by navigating to a route.
   *
   * @param id {String} unique id of the member to edit.
   */
  editBlacklist: function (id) {
    messageBus.command('route:admin/blacklist/:id', id);
  }
});

module.exports = MembersController;
