var Form = require('../../common/views/formWithErrorHandling');

var RegisterView = Form.extend({
  template : require('./template.hbs'),
  tag      : 'div',
  className: 'well',
  idPrefix : 'user',

  ui: Form.extendUi({
    'reset' : '.form-reset',
    'nation': '#account-nation',
    'level': '#account-level'
  }),

  events: Form.extendEvents({
    'click @ui.reset': 'resetClicked'
  }),

  resetClicked: function (e) {
    e.preventDefault();
    this.render();
  },

  onRender: function () {
    var self = this;

    this.loadCountries();

    self.ui.level.val(self.model.get('level'));
  }

});

module.exports = RegisterView;
