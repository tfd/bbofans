var Form = require('../../common/views/formWithErrorHandling');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');

var LoginView = Form.extend({
  template: require('./template.hbs'),
  idPrefix: 'login'
});

module.exports = LoginView;
