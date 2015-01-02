var Form = require('../../common/views/formWithErrorHandling');

var RegisterView = Form.extend({
  template: require('./template.hbs'),
  tag: 'div',
  className: 'well',
  idPrefix: 'member',

  ui: Form.extendUi({
    'reset': '.form-reset',
    'nation': '#member-nation'
  }),

  events: Form.extendEvents({
    'click @ui.reset': 'resetClicked'
  }),

  resetClicked: function (e) {
    e.preventDefault();
    this.render();
  },

  onRender: function () {
    this.loadCountries();

    Recaptcha.create("6Ldpiv0SAAAAABQTt9sEh3l6nT2ixMwFVJLZl47I", "member-recaptcha", {
      theme: "white"
    });
  },

  onBeforeDestroy: function () {
    Recaptcha.destroy();
  }

});

module.exports = RegisterView;
