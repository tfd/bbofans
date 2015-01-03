/* jshint -W097 */
"use strict";

var Form = require('../../common/views/formWithErrorHandling');

var HomepageLoginView = Form.extend({
  template: require('./template.hbs'),
  idPrefix: 'login'
});

module.exports = HomepageLoginView;
