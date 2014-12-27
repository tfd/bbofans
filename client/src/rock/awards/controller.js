var Marionette = require('backbone.marionette');
var $ = require('jquery');

var RockAwardsView = require('./view');
var Member = require('../../common/models/member');

var RockAwardsController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('rock:awards:show', function () {
      self.show();
    });
  },

  show: function () {
    var self = this;
    var member = new Member();
    var view = new RockAwards({
      model: member
    });

    this.region.show(view);
  }
});

module.exports = RockAwardsController;
