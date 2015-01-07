/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
require('bootstrap-table-filter');
require('../../common/table/bootstrap-table-remote-export');
require('../../common/utils/formatHelpers');

var TdsView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    table: "table"
  },

  reloadTable: function () {
    this.$el.find(this.ui.table).bootstrapTable('refresh');
  },

  onRender: function() {
    var self = this;

    this.ui.table.bootstrapTable().on('click-row.bs.table', function (e, row) {
      e.preventDefault();
      self.trigger('tds:edit', row._id);
    });
  }
});

module.exports = TdsView;
