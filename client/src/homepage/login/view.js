/* jshint -W097 */
"use strict";

var Form = require('../../common/views/formWithErrorHandling');

var HomepageLoginView = Form.extend({
  template: require('./template.hbs'),
  idPrefix: 'login',

  ui: Form.extendUi( {
    forgotPassword: '#login-forgot-password'
  }),

  triggers: Form.extendTriggers({
    'click @ui.forgotPassword': 'forgot:password'
  })
});

module.exports = HomepageLoginView;
