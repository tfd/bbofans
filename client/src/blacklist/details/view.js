var Marionette = require('backbone.marionette');

var EntryView = Marionette.ItemView.extend({
  template: require('./template.hbs'),
  tagName: 'div',
  className: 'panel panel-default'
});

module.exports = EntryView;
