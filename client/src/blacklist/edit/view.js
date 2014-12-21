var Marionette = require('backbone.marionette');
var EntryView = require('../details/view');

var BlacklistView = Marionette.CompositeView.extend({
  template: require('./template.hbs'),

  childView: EntryView,
  childViewContainer: 'div.reason-list'
});

module.exports = BlacklistView;
