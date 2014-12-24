var FormWithErrorHandling = require('../../common/views/formWithErrorHandling.js');
var moment = require('moment');
require('bootstrap-dateTimePicker');

var BlacklistView = FormWithErrorHandling.extend({
  template: require('./blacklist.hbs'),
  idPrefix: 'blacklist',
  submitEvent: 'command:execute',

  ui: FormWithErrorHandling.extendUi({
    'from': '#blacklist-from',
    'for': '#blacklist-for'
  }),

  onRender: function () {
    this.ui.from.datetimepicker({
      pickTime: false
    });
    if (this.model.get('command') === 'blacklist') {
      this.ui.from.data("DateTimePicker").setDate(moment.utc());
      this.ui.for.val(this.model.get('for'));
    }
    else {
      this.ui.from.data("DateTimePicker").setDate(moment.utc().add(-2, 'd'));
      this.ui.for.val('1d');
    }
  }

});

module.exports = BlacklistView;
