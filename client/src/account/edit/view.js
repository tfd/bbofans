var FormWithErrorHandling = require('../../common/views/formWithErrorHandling');

var AccountView = FormWithErrorHandling.extend({
  template : require('./template.hbs'),
  tag      : 'div',
  className: 'well',
  idPrefix : 'account',

  ui: FormWithErrorHandling.extendUi({
    'reset' : '.form-reset',
    'nation': '#account-nation',
    'level': '#account-level'
  }),

  events: FormWithErrorHandling.extendEvents({
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

module.exports = AccountView;
