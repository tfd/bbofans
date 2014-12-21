var Marionette = require('backbone.marionette');
require('backbone.syphon');

function clearFormErrors($view){
  var $form = $view.find("form");
  $form.find(".help-inline.error").each(function () {
    $(this).remove();
  });
  $form.find(".control-group.error").each(function () {
    $(this).removeClass("has-error");
  });
}

var FormView = Marionette.ItemView.extend({
  ui: {
    'execute': '#command-execute'
  },

  events: {
    'click @ui.execute' : 'executeClicked'
  },

  idPrefix: 'email',

  executeClicked: function () {
    var model = this.model.toJSON();
    var data = Backbone.Syphon.serialize(this);
    this.trigger('command:execute', $.extend({}, model, data));
  },

  onFormDataInvalid: function (errors) {
    var self = this;
    var $view = this.$el;

    clearFormErrors($view);
    $.each(errors, function (key, value) {
      var $controlGroup = $view.find('#' + self.idPrefix + '-' + key).parent();
      var $errorEl = $("<span>", { class: "help-inline error", text: value });
      $controlGroup.addClass("has-error").append($errorEl);
    });
  }

});

FormView.extendUi = function (ui) {
  return _.extend({}, FormView.prototype.ui, ui);
};

FormView.extendEvents = function (events) {
  return _.extend({}, FormView.prototype.events, events);
};

module.exports = FormView;
