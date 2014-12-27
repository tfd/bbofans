var Marionette = require('backbone.marionette');
var $ = require('jquery');

var RbdMembersView = require('./view');
var Member = require('../../common/models/member');

var RbdMembersController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('rbd:member:show', function () {
      self.show();
    });
  },

  show: function () {
    var self = this;
    var member = new Member();
    var view = new RbdMembersView({
      model: member
    });

    this.region.show(view);
  }
});

module.exports = RbdMembersController;
