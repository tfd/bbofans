/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var $ = require('jquery');
var messageBus = require('../../common/router/messageBus');
var authentication = require('../../authentication/controller');

var TdListView = require('./view');
var Member = require('../../models/member');

var TdListControllerImpl = function (options) {
  var self = this;

  /*
   * User wants to edit a member.
   *
   * This is done by navigating to a route.
   *
   * @param id {String} unique id of the member to edit.
   */
  function editMember(id) {
    if (authentication.getUser().get('isMemberManager')) {
      messageBus.command('route:admin/members/:id', id);
    }
    else {
      messageBus.command('route:admin/tds/:id', id);
    }
  }

  /*
   * Public methods.
   */

  /**
   * Create and show the view.
   */
  this.show = function (region) {
    var member = new Member();

    this.view = new TdListView({
      model: member
    });
    this.view.on('tds:edit', editMember);

    messageBus.on('members:changed', function  () {
      self.view.reloadTable();
    });

    region.show(this.view);
  };

  /*
   * Everything is in place, startup the controller.
   */

  this.app = options.app;
  this.module = options.module;
};

var TdListController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new TdListControllerImpl(options);
  },

  show: function (region) {
    this.impl.show(region);
  }
});

module.exports = TdListController;
