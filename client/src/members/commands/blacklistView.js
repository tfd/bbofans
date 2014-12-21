var FormView = require('./formView');
require('backbone.syphon');
var moment = require('moment');

var BacklistView = FormView.extend({
  template: require('./blacklist.hbs'),
  idPrefix: 'blacklist',

  ui: FormView.extendUi({
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

module.exports = BacklistView;
