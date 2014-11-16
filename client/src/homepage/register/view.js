var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');

var Member = require('../../common/models/member');

var RegisterView = Marionette.ItemView.extend({
  template: require('./template.hbs'),
  events: {
    'click #form-register': 'submitClicked',
    'click #form-reset': 'resetClicked'
  },

  submitClicked: function (e) {
    e.preventDefault();
    var data = Backbone.Syphon.serialize(this);
    this.trigger("form:submit", data);
  },

  resetClicked: function (e) {
    e.preventDefault();
    this.render();
  },

  onRender: function () {
    var selectEl = this.$el.find('#member-nation');

    $.getJSON('/data/countries.json', function (countries) {
      $.each(countries, function (i, country) {
        $('<option/>', {
          value: country,
          text: country
        }).appendTo(selectEl);
      });

      if (this.model && this.model.nation) {
        selectEl.val(this.model.nation);
      }
    });

    Recaptcha.create("6Ldpiv0SAAAAABQTt9sEh3l6nT2ixMwFVJLZl47I", "member-recaptcha", {
      theme: "white"
    });
  },

  onBeforeDestroy: function () {
    Recaptcha.destroy();
  },

  onFormDataInvalid: function (errors) {
    var $view = this.$el;

    var clearFormErrors = function(){
      var $form = $view.find("form");
      $form.find(".help-inline.error").each(function(){
        $(this).remove();
      });
      $form.find(".control-group.error").each(function(){
        $(this).removeClass("error");
      });
    };

    var markErrors = function(value, key){
      var $controlGroup = $view.find("#member-" + key).parent().parent();
      var $errorEl = $("<span>", { class: "help-inline error", text: value });
      $controlGroup.append($errorEl).addClass("error");
    };

    clearFormErrors();
    _.each(errors, markErrors);
  }
});

module.exports = RegisterView;
