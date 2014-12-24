var Marionette = require('backbone.marionette');

var FlagView = Marionette.ItemView.extend({
  template: require('./flag.hbs'),

  ui: {
    submit: '.form-submit'
  },

  events: {
    'click @ui.submit' : 'submitClicked'
  },

  submitClicked: function () {
    this.trigger('command:execute', this.model.toJSON());
  }

});

module.exports = FlagView;
