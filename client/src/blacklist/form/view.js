/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var FormWithErrorHandling = require('../../common/views/formWithErrorHandling');
var moment = require('moment');
var $ = require('jquery');
var _ = require('underscore');

require('bootstrap-dateTimePicker');

var Blacklist = require('../../models/blacklist');

var BlacklistFormView = FormWithErrorHandling.extend({
  template: require('./template.hbs'),
  idPrefix: 'blacklist',

  ui: FormWithErrorHandling.extendUi({
    'from'   : '#blacklist-from',
    'for'    : '#blacklist-for',
    'td'     : '#blacklist-td',
    typeAhead: '#blacklist-bboName'
  }),

  onRender: function () {
    this.ui.from.datetimepicker({
      pickTime: false
    });
    this.ui.from.data("DateTimePicker").setDate(this.model.get('from') ? moment(this.model.get('from')) : moment.utc());
    this.ui.for.val(this.model.get('for'));
    this.loadTds();
  },

  /**
   * Load TDs from json and fill a select box.
   *
   * The select box must be identified as @ui.tds and the model must have a td attribute.
   */
  loadTds: function () {
    var self = this;

    $.getJSON('/admin/tds/bboNames', function (tds) {
      _.each(tds, function (td) {
        $('<option/>', {
          value: td,
          text : td
        }).appendTo(self.ui.td);
      });

      if (self.model && self.model.get('td')) {
        self.ui.td.val(self.model.get('td'));
      }
    });
  }

});

module.exports = BlacklistFormView;
