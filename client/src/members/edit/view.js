var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');

var Member = require('../../common/models/member');

var EditMemberView = Marionette.ItemView.extend({
  template: require('./template.hbs'),
  events: {
    'click #form-validate': 'validateClicked',
    'click #form-save': 'saveClicked',
    'click #form-cancel': 'cancelClicked'
  },

  saveClicked: function (e) {
    e.preventDefault();
    var data = Backbone.Syphon.serialize(this);
    this.trigger("form:submit", data);
  },

  validateClicked: function (e) {
    e.preventDefault();
    var data = Backbone.Syphon.serialize(this);
    this.trigger("form:validate", data);
  },

  cancelClicked: function (e) {
    e.preventDefault();
    this.trigger("form:cancel");
  },

  onRender: function () {
    var self = this;
    var countryEl = this.$el.find('#member-nation');
    var levelEl = this.$el.find('#member-level');

    $.getJSON('/data/countries.json', function (countries) {
      $.each(countries, function (i, country) {
        $('<option/>', {
          value: country,
          text: country
        }).appendTo(countryEl);
      });

      if (self.model && self.model.get('nation')) {
        countryEl.val(self.model.get('nation'));
      }
    });

    levelEl.val(self.model.get('level'));
  },

  onBeforeDestroy: function () {
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
      var $controlGroup = $view.find("#member-" + key).parent().parent();
      var $errorEl = $("<span>", { class: "help-inline error", text: value });
      $controlGroup.append($errorEl).addClass("error");
    });
  }
});

module.exports = EditMemberView;
