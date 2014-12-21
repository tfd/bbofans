var Marionette = require('backbone.marionette');

var FlagView = Marionette.ItemView.extend({
  template: require('./flag.hbs'),

  events: {
    'click #command-execute' : 'executeClicked'
  },

  executeClicked: function () {
    this.trigger('command:execute', this.model.toJSON());
  }

});

module.exports = FlagView;
