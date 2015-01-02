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
 * Fired immediately before the form data is serialized, so you can do some adjustments.
 * 
 * @event before:form:serialize/onBeforeFormSerialize
 */

/**
 * Fired immediately after the form data is serialized, but before form:submit is fired.
 * 
 * @event form:serialize/onFormSerialize
 * @type {object} - the form data serialized with Backbone.Syphon.
 */

var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');
var _ = require('underscore');
var handleFormErrors = require('../../common/utils/handleFormErrors.js');

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
 * @class
 * @constructor
 * @extends Marionette.ItemView
 */
var FormWithErrorHandlingView = Marionette.ItemView.extend({
  tag: 'div',
  className: 'well',
  
  ui: {
    submit : '.form-submit',
    cancel : '.form-cancel'
  },

  events: {
    'click @ui.submit': 'submitClicked'
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
   * Event to trigger when submitting the form. Defaults to form:submit.
   */
  submitEvent: 'form:submit',

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
  submitClicked: function (e) {
    e.preventDefault();

    this.triggerMethod('before:form:serialize');
    var model = this.model ? this.model.toJSON() : {};
    var data = _.extend({}, model, Backbone.Syphon.serialize(this));
    this.triggerMethod('form:serialize', data);

    this.trigger(this.getOption('submitEvent'), data);
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
    handleFormErrors(this, this.getOption('idPrefix'), errors);
  },

  /**
   * Load countries from json and fill a select box.
   *
   * The select box must be identified as @ui.nation and the model must have a nation attribute.
   */
  loadCountries: function () {
    var self = this;

    $.getJSON('/data/countries.json', function (countries) {
      _.each(countries, function (country) {
        $('<option/>', {
          value: country,
          text: country
        }).appendTo(self.ui.nation);
      });

      if (self.model && self.model.get('nation')) {
        self.ui.nation.val(self.model.get('nation'));
      }
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
