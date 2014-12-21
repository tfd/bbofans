var Form = require('../../common/views/formWithErrorHandling');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');

var Member = require('../../common/models/member');

var EditMemberView = Form.extend({
  template: require('./template.hbs'),
  idPrefix: 'member',

  ui: Form.extendUi({
    'validate': '.form-validate',
    'nation': '#member-nation',
    'level': '#member-level'
  }),

  events: Form.extendEvents({
    'click @ui.validate': 'validateClicked',
  }),

  validateClicked: function (e) {
    e.preventDefault();
    var data = Backbone.Syphon.serialize(this);
    this.trigger("form:validate", data);
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

      if (self.model && self.model.get('nation')) {
        self.ui.nation.val(self.model.get('nation'));
      }
    });

    self.ui.level.val(self.model.get('level'));
  }

});

module.exports = EditMemberView;
