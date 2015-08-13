/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var moment = require('moment');
require('bootstrap-table-filter');
require('../../common/table/bootstrap-table-colgroups');
require('../../common/table/bootstrap-table-commands');
require('../../common/table/bootstrap-table-remote-export');
require('../../common/utils/formatHelpers');

var BlacklistView = Marionette.ItemView.extend({
  template : require('./template.hbs'),
  className: 'well',

  ui: {
    table : 'table#list-blacklist',
    new   : '.form-new',
    remove: '.form-remove'
  },

  triggers: {
    'click @ui.new'   : 'blacklist:new',
    'click @ui.remove': 'blacklist:remove'
  },

  reloadTable: function () {
    this.$el.find(this.ui.table).bootstrapTable('refresh');
  },

  onRender: function () {
    var self = this;

    this.ui.table.bootstrapTable({
      responseHandler: function (res) {
        res.rows.forEach(function (member) {
          if (member.entries.length > 0) {
            var last = member.entries[member.entries.length - 1];
            member.lastTd = last.td;
            member.lastFrom = last.from;
            member.lastTo = last.to;
            member.lastReason = last.reason;
          }
        });
        return res;
      },

      rowStyle: function (member) {
        var end = moment(member.lastTo),
            today = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0}),
            diff = end.diff(today, 'days');

        console.log(today.format() + " : " + end.format() + " = " + diff);
        if (diff >= 210) {
          return {classes: 'bg-danger'};
        }
        if (diff >= 32) {
          return {classes: 'bg-warning'};
        }
        if (diff >= 14) {
          return {classes: 'bg-success'};
        }
        if (diff >= 7) {
          return {classes: 'bg-info'};
        }

        return {};
      }
    }).on('click-row.bs.table', function (e, row, $el) {
      e.preventDefault();
      self.trigger('blacklist:edit', row._id);
    });
  }
});

module.exports = BlacklistView;
