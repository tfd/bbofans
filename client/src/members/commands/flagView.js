/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var MemberCommandsFlagView = Marionette.ItemView.extend({
  template: require('./flag.hbs'),

  ui: {
    submit: '.form-submit'
  },

  events: {
    'click @ui.submit' : 'submitClicked'
  },

  submitClicked: function () {
    this.trigger('form:submit', this.model.toJSON());
  }

});

module.exports = MemberCommandsFlagView;
