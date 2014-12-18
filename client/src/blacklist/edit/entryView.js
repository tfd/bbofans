var Marionette = require('backbone.marionette');
require('bootstrap-datetimepicker');

var EntryView = Marionette.ItemView.extend({
  template: require('./entry.hbs'),
  tagName: 'div',
  className: 'panel panel-default',
  
  initialize: function(options) {
    this.model.set('childIndex', options.childIndex);
  },

  onRender: function () {
    var $fromEl = this.$el.find('#blacklist-fromDate-' + this.model.get('childIndex'));
    var $toEl = this.$el.find('#blacklist-toDate-' + this.model.get('childIndex'));
    $fromEl.datetimepicker({
      pickTime: false
    });
    $toEl.datetimepicker({
      pickTime: false
    });
    $fromEl.data("DateTimePicker").setDate(this.model.get('fromDate'));
    $toEl.data("DateTimePicker").setDate(this.model.get('toDate'));
    $fromEl.on("dp.change",function (e) {
      $toEl.data("DateTimePicker").setMinDate(e.date);
    });
    $toEl.on("dp.change",function (e) {
      $fromEl.data("DateTimePicker").setMaxDate(e.date);
    });
  }

});

module.exports = EntryView;
