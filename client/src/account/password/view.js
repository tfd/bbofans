/* jshint -W097 */
"use strict";

var Form = require('../../common/views/formWithErrorHandling');

var Member = require('../../models/member');

var AdminAccountView = Form.extend({
  template : require('./template.hbs'),
  tag      : 'div',
  className: 'well',
  idPrefix : 'password'
});

module.exports = AdminAccountView;
