/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var FormWithErrorHandling = require('../../common/views/formWithErrorHandling');
var moment = require('moment');
require('bootstrap-dateTimePicker');

var Blacklist = require('../../models/blacklist');

var BlacklistFormView = FormWithErrorHandling.extend({
  template: require('./template.hbs'),
  idPrefix: 'blacklist',
  
  ui: FormWithErrorHandling.extendUi({
    'from': '#blacklist-from',
    'for': '#blacklist-for',
    typeAhead: '#blacklist-bboName'
  }),

  onRender: function () {
    this.ui.from.datetimepicker({
      pickTime: false
    });
    this.ui.from.data("DateTimePicker").setDate(this.model.get('from') ? moment(this.model.get('from')) : moment.utc());
    this.ui.for.val(this.model.get('for'));
  }

});

module.exports = BlacklistFormView;
