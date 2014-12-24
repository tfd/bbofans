var FormWithErrorHandling = require('../../common/views/formWithErrorHandling.js');

var FormView = FormWithErrorHandling.extend({
  idPrefix: 'email',
  submitEvent: 'command:execute'
});

module.exports = FormView;
