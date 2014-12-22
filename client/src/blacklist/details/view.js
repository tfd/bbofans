var Marionette = require('backbone.marionette');
var EntryView = require('./entryView');

var BlacklistView = Marionette.CompositeView.extend({
  template: require('./template.hbs'),

  childView: EntryView,
  childViewContainer: 'div.reason-list',

  onBeforeRender: function () {
    this.collection = this.model.get('entries');
  }
});

module.exports = BlacklistView;
