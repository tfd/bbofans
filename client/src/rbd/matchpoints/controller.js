var Marionette = require('backbone.marionette');
var $ = require('jquery');

var View = require('./view');
var Member = require('../../common/models/member');

var MatchpointsController = Marionette.Controller.extend({
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
    var view = new View({
      model: member
    });

    this.region.show(view);
  }
});

module.exports = MatchpointsController;
