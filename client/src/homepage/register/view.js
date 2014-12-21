var Backbone = require('backbone');
var Form = require('../../common/views/formWithErrorHandling');
require('backbone.syphon');
var $ = require('jquery');

var Member = require('../../common/models/member');

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
    var self = this;

    $.getJSON('/data/countries.json', function (countries) {
      $.each(countries, function (i, country) {
        $('<option/>', {
          value: country,
          text: country
        }).appendTo(self.ui.nation);
      });

      if (this.model && this.model.nation) {
        self.ui.nation.val(this.model.nation);
      }
    });

    Recaptcha.create("6Ldpiv0SAAAAABQTt9sEh3l6nT2ixMwFVJLZl47I", "member-recaptcha", {
      theme: "white"
    });
  },

  onBeforeDestroy: function () {
    Recaptcha.destroy();
  }

});

module.exports = RegisterView;
