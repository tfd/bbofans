/* jshint -W097 */
"use strict";

var Form = require('../../common/views/formWithErrorHandling');
var reCaptcha = require('../../common/utils/reCaptcha');

var RegisterView = Form.extend({
  template: require('./template.hbs'),
  tag: 'div',
  className: 'well',
  idPrefix: 'register',

  ui: Form.extendUi({
    'reset': '.form-reset',
    'nation': '#register-nation',
    'reCaptcha': '#register-reCaptcha'
  }),

  events: Form.extendEvents({
    'click @ui.reset': 'resetClicked'
  }),

  resetClicked: function (e) {
    e.preventDefault();
    this.render();
  },

  onRender: function () {
    this.loadCountries();
    reCaptcha.render(this.ui.reCaptcha[0]);
  },

  onFormDataInvalid: function (errors) {
    Form.prototype.onFormDataInvalid.call(this, errors);
    reCaptcha.reset();
  }

});

module.exports = RegisterView;
