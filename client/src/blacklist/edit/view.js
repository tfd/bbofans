var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');
require('bootstrap-datetimepicker');

var Blacklist = require('../models/blacklist');
var EntryView = require('./entryView');

Backbone.Syphon.InputReaders.register("datepicker", function ($el) {
  return $el.parent().data("DateTimePicker").getDate().format('DD-MM-YYYY');
});

var EditBlacklistView = Marionette.CompositeView.extend({
  template: require('./template.hbs'),
  tagName: 'div',
  className: 'well',

  childView: EntryView,
  childViewContainer: 'div.reason-list',
  childViewOptions: function(model, index) {
    // Pass the child index to the view.
    return {
      childIndex: index
    };
  },

  events: {
    'click #form-save': 'saveClicked',
    'click #form-cancel': 'cancelClicked'
  },

  saveClicked: function (e) {
    e.preventDefault();
    var data = Backbone.Syphon.serialize(this);
    // entries is an object in the form {<index>: {_id: <_id>, fromDate: <fromDate>, toDate: <toDate>, reason: <reason>}}
    var arr = [];
    for (var key in data.entries) {
      arr.push(data.entries[key]);
    }
    data.entries = arr;
    this.trigger("form:submit", data);
  },

  cancelClicked: function (e) {
    e.preventDefault();
    this.trigger("form:cancel");
  },

  onFormDataInvalid: function (errors) {
    var self = this;
    var $view = this.$el;

    var clearFormErrors = function(){
      var $form = $view.find("form");
      $form.find(".help-inline.error").each(function(){
        $(self).remove();
      });
      $form.find(".control-group.error").each(function(){
        $(self).removeClass("error");
      });
    };

    clearFormErrors();
    $.each(errors, function (key, value) {
      var $controlGroup = $view.find("#blacklist-" + key).parent().parent();
      var $errorEl = $("<span>", { class: "help-inline error", text: value });
      $controlGroup.append($errorEl).addClass("error");
    });
  }
});

module.exports = EditBlacklistView;
