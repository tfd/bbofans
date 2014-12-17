var Marionette = require('backbone.marionette');
var $ = require('jquery');
require('backbone.syphon');

var EmailView = Marionette.ItemView.extend({
  template: require('./email.hbs'),

  events: {
    'click #command-execute' : 'executeClicked'
  },

  executeClicked: function () {
    var model = this.model.toJSON();
    var data = Backbone.Syphon.serialize(this);
    this.trigger('command:execute', $.extend({}, model, data));
  }
});

module.exports = EmailView;
