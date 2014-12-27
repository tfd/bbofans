var Marionette = require('backbone.marionette');
var $ = require('jquery');

var RbdAwardsView = require('./view');
var Member = require('../../common/models/member');

var RbdAwardsController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('rbd:awards:show', function () {
      self.show();
    });
  },

  show: function () {
    var self = this;
    var member = new Member();
    var view = new RbdAwardsView({
      model: member
    });

    this.region.show(view);
  }
});

module.exports = RbdAwardsController;
