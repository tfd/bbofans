var Marionette = require('backbone.marionette');
var View = require('./view');

var HomeController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('admin:home:show', function () {
      self.show();
    });
  },

  show: function () {
    var self = this;
    var member = new Member();
    var view = new View({
      model: self.app.currentUser
    });

    this.region.show(view);
  }
});

module.exports = HomeController;
