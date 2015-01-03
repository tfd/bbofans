/* jshint -W097 */
"use strict";

var $ = require('jquery');

function clearFormErrors ($view){
  var $form = $view.find("form");
  $form.find(".help-inline.error").each(function () {
    $(this).remove();
  });
  $form.find(".control-group.error").each(function () {
    $(this).removeClass("has-error");
  });
}

module.exports = function displayFormErrors (view, idPrefix, errors) {
  var $view = view.$el;

  clearFormErrors($view);
  $.each(errors, function (key, value) {
    var $controlGroup = $view.find('#' + idPrefix + '-' + key).parent();
    var $errorEl = $("<span>", { class: "help-inline error", text: value });
    $controlGroup.addClass("has-error").append($errorEl);
  });
};

