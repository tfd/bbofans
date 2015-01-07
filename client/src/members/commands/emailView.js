/* jshint -W097 */
"use strict";

var FormWithErrorHandling = require('../../common/views/formWithErrorHandling.js');
var tinyMce = require('tinymce');

var MemberCommandsEmailView = FormWithErrorHandling.extend({
  idPrefix: 'email',

  onShow: function () {
    tinyMce.init({
      selector: '#email-message',
      menubar : false
    });
  }

});

module.exports = MemberCommandsEmailView;
