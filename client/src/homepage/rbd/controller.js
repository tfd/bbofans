var Marionette = require('backbone.marionette');
var $ = require('jquery');
var messageBus = require('../../common/utils/messageBus');

var RbdMembersView = require('./view');
var Member = require('../../common/models/member');

var RbdMembersController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region) {
    var member = new Member();
    var view = new RbdMembersView({
      model: member
    });

    region.show(view);
  }
});

module.exports = RbdMembersController;
