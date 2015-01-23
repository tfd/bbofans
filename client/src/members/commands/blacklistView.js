/* jshint -W097 */
"use strict";

var FormWithErrorHandling = require('../../common/views/formWithErrorHandling.js');
var moment = require('moment');
require('bootstrap-dateTimePicker');

var MemberCommandsBlacklistView = FormWithErrorHandling.extend({
  template: require('./blacklist.hbs'),
  idPrefix: 'blacklist',

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
      this.ui.for.val('1w');
    }
    else {
      this.ui.from.data("DateTimePicker").setDate(moment.utc().add(-2, 'd'));
      this.ui.for.val('1d');
    }
  }

});

module.exports = MemberCommandsBlacklistView;
