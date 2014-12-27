var Marionette = require('backbone.marionette');
var $ = require('jquery');

var RbdMatchpointsView = require('./view');
var Member = require('../../common/models/member');

var RbdMatchpointsController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('rbd:matchpoints:show', function () {
      self.show();
    });
  },

  show: function () {
    var self = this;
    var member = new Member();
    var view = new RbdMatchpointsView({
      model: member
    });

    this.region.show(view);
  }
});

module.exports = RbdMatchpointsController;
