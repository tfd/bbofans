/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var EntryView = require('./entryView');

var BlacklistDetailsView = Marionette.CompositeView.extend({
  template: require('./template.hbs'),

  childView: EntryView,
  childViewContainer: 'div.reason-list',

  ui: {
    'close': '.form-close'
  },

  trigger: {
    'click @ui.close' : 'form:close'
  },

  onBeforeRender: function () {
    this.collection = this.model.get('entries');
  }
});

module.exports = BlacklistDetailsView;
