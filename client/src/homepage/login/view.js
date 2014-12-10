var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');

var LoginView = Marionette.ItemView.extend({
  template: require('./template.hbs'),
  events: {
    'click #form-login': 'submitClicked',
    'click #form-cancel': 'cancelClicked'
  },

  submitClicked: function (e) {
    e.preventDefault();
    var data = Backbone.Syphon.serialize(this);
    this.trigger("form:submit", data);
  },

  cancelClicked: function (e) {
    e.preventDefault();
    this.trigger("form:cancel");
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

    clearFormErrors();
    $.each(errors, function (key, value) {
      var $controlGroup = $view.find("#admin-" + key).parent().parent();
      var $errorEl = $("<span>", { class: "help-inline error", text: value });
      $controlGroup.append($errorEl).addClass("error");
    });
  }
});

module.exports = LoginView;
