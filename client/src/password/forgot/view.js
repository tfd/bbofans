/* jshint -W097 */
"use strict";

var Form = require('../../common/views/formWithErrorHandling');

var PasswordForgotView = Form.extend({
  template: require('./template.hbs'),
  idPrefix: 'forgot'
});

module.exports = PasswordForgotView;
