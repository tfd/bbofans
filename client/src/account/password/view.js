var Form = require('../../common/views/formWithErrorHandling');

var Member = require('../../models/member');

var RegisterView = Form.extend({
  template : require('./template.hbs'),
  tag      : 'div',
  className: 'well',
  idPrefix : 'password'
});

module.exports = RegisterView;
