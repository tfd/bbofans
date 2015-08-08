/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');

var MemberListView = require('./view');
var Member = require('../../models/member');
var MemberCommandsController = require('../commands/controller');
var NewMemberController = require('../new/controller');

var MemberListControllerImpl = function (options) {
  var self = this;

  /*
   * User wants to execute a bulk command on selected users.
   *
   * This is handled through a popup.
   */
  function executeCommand(command, rows) {
    self.commandsController.show(self.app.getPopupRegion(), command, rows);
  }

  /*
   * User wants to edit a member.
   *
   * This is done by navigating to a route.
   *
   * @param id {String} unique id of the member to edit.
   */
  function editMember(id) {
    messageBus.command('route:admin/members/:id', id);
  }

  /*
   * User wants to create a new member.
   *
   * This is done by navigating to a route.
   */
  function createMember() {
    self.newMemberController.show(self.app.getPopupRegion());
  }

  /*
   * Public methods.
   */

  /**
   * Create and show the view.
   */
  this.show = function (region) {
    var member = new Member();

    this.view = new MemberListView({
      model: member
    });
    this.view.on('members:edit', editMember);
    this.view.on('members:create', createMember);
    this.view.on('members:command', executeCommand);

    messageBus.on('members:changed', function () {
      self.view.reloadTable();
    });

    region.show(this.view);
  };

  /*
   * Everything is in place, startup the controller.
   */

  this.app = options.app;
  this.module = options.module;

  this.commandsController = new MemberCommandsController({
    app   : this.app,
    module: this.module
  });

  this.newMemberController = new NewMemberController({
    app   : this.app,
    module: this.module
  });
};

var MemberListController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new MemberListControllerImpl(options);
  },

  show: function (region) {
    this.impl.show(region);
  }
});

module.exports = MemberListController;
