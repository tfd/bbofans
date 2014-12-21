/**
 * @module FormWithErrorHandlingView
 */

/**
 * Submit form event.
 *
 * @event form:submit
 * @type {object} - the form data serialized with Backbone.Syphon.
 */

/**
 * Cancel form event.
 *
 * @event form:cancel
 * @type {object} - information about the view that triggered the event
 * @property {object} view - the view instance that triggered the event
 * @property {object} model - the view.model, if one was set on the view
 * @property {object} collection - the view.collection, if one was set on the view
 */

/**
 * Fired immediatly before the form data is serialized, so you can do some adjustments.
 * 
 * @event before:form:serialize/onBeforeFormSerialize
 */

/**
 * Fired immediatly after the form data is serialized, but before form:submit is fired.
 * 
 * @event form:serialize/onFormSerialize
 * @type {object} - the form data serialized with Backbone.Syphon.
 */

var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');

function clearFormErrors($view){
  var $form = $view.find("form");
  $form.find(".help-inline.error").each(function () {
    $(this).remove();
  });
  $form.find(".control-group.error").each(function () {
    $(this).removeClass("has-error");
  });
}

/**
 * Returns an Marionette#ItemView that handles a form with a Cancel and a Save button
 * and displays inline errors.
 *
 * The Save and Cancel buttons are identified by the selectors: '.form-save' and
 * '.form-cancel'. Note the use of classes, not ids in order to permit multiple forms
 * on the same page. You can change these selectors by overriding the ui object when extending
 * the form:
 *
 * <code>
 * var myForm = FormWithErrorHandling.extend({
 *   ui : {
 *     'save' : '#myForm-save-id',
 *     'cancel' : '#myForm-cancel-id'
 *   }
 * });
 * </code>
 *
 * The FormWithErrorHandling view uses ui, events, and triggers so if your form use them too
 * you must inherit the properties like this: 
 *
 * <code>
 * var myForm = FormWithErrorHandling.extend({
 *   ui : FormWithErrorHandling.extendUi({
 *     'reset' : '.form-reset'
 *   }),
 *
 *   events : FormWithErrorHandling.extendEvents({
 *     'click input:checkbox' : 'checkThis'
 *   }),
 *
 *   triggers : FormWithErrorHandling.extendTriggers({
 *     'click input:checkbox' : 'checkThis'
 *   })
 * });
 * </code>
 *
 * @fires form:submit
 * @fires form:cancel
 * @constructor
 */
var FormWithErrorHandlingView = Marionette.ItemView.extend({
  tag: 'div',
  className: 'well',
  
  ui: {
    save : '.form-save',
    cancel : '.form-cancel'
  },

  events: {
    'click @ui.save': 'saveClicked'
  },

  triggers: {
    'click @ui.cancel': 'form:cancel'
  },

  /**
   * Prefix to be added to the ids of the input controls.
   * The resulting id will be <idPrefix>-<fieldName>. All input elements in the form
   * must have the id in this format because it's used to add the inline error message
   * to the correct input element.
   */
  idPrefix: 'form',

  /**
   * Save button has been clicked.
   *
   * Will serialize the form data using Backbone.Syphon and then fire the form:submit event.
   * Before
   *
   * You can obviously override this method to do something else instead.
   *
   * @fires before:form:serialize
   * @fires form:serialize
   * @fires form:submit
   */
  saveClicked: function (e) {
    e.preventDefault();

    this.triggerMethod('before:form:serialize');
    var data = Backbone.Syphon.serialize(this);
    this.triggerMethod('form:serialize', data);

    this.trigger("form:submit", data);
  },

  /**
   * Call this to display inline errors.
   *
   * Will reset all error messages and display the new ones documented in the errors
   * parameter.
   *
   * The errors parameter is a hash map of field names that hollds an error message
   * for each field that has an error.
   *
   * @param {object} errors - hash map of error for each field.
   */
  onFormDataInvalid: function (errors) {
    var self = this;
    var $view = this.$el;

    clearFormErrors($view);
    $.each(errors, function (key, value) {
      var $controlGroup = $view.find('#' + self.getOption('idPrefix') + '-' + key).parent();
      var $errorEl = $("<span>", { class: "help-inline error", text: value });
      $controlGroup.addClass("has-error").append($errorEl);
    });
  }

});

/**
 * Utility method to add ui elements in the extending view.
 */
FormWithErrorHandlingView.extendUi = function (ui) {
  return _.extend({}, FormWithErrorHandlingView.prototype.ui, ui);
};

/**
 * Utility method to add events elements in the extending view.
 */
FormWithErrorHandlingView.extendEvents = function (events) {
  return _.extend({}, FormWithErrorHandlingView.prototype.events, events);
};

/**
 * Utility method to add triggers elements in the extending view.
 */
FormWithErrorHandlingView.extendTriggers = function (triggers) {
  return _.extend({}, FormWithErrorHandlingView.prototype.triggers, triggers);
};

module.exports = FormWithErrorHandlingView;
