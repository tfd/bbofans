var FormWithErrorHandling = require('../../common/views/formWithErrorHandling.js');

var MemberCommandsEmailView = FormWithErrorHandling.extend({
  idPrefix: 'email',
  submitEvent: 'command:execute'
});

module.exports = MemberCommandsEmailView;
