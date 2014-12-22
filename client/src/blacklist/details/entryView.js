var Marionette = require('backbone.marionette');

var EntryView = Marionette.ItemView.extend({
  template: require('./entry.hbs'),
  tagName: 'div',
  className: 'panel panel-default'
});

module.exports = EntryView;
