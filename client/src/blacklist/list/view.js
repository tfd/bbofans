var Marionette = require('backbone.marionette');
require('bootstrap-table-filter');
require('../../common/utils/bootstrap-table-colgroups');
require('../../common/utils/bootstrap-table-commands');
require('../../common/utils/formatters');

var BlacklistView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    table: 'table',
    filter: '#filter-bar',
    new: '.form-new'
  },

  triggers: {
    'click @ui.new': 'blacklist:new'
  },

  reloadTable: function () {
    this.$el.find(this.ui.table).bootstrapTable('refresh');
  },

  onRender: function() {
    var self = this;

    this.ui.table.bootstrapTable({
      responseHandler: function (res) {
        res.rows.forEach( function (member, i) {
          if (member.entries.length > 0) {
            var last = member.entries[member.entries.length - 1];
            member.lastFrom = last.from;
            member.lastTo =last.to;
            member.lastReason = last.reason;
          }
        });
        return res;
      }
    }).on('click-row.bs.table', function (e, row, $el) {
      e.preventDefault();
      self.trigger('blacklist:edit', row._id);
    });
  }
});

module.exports = BlacklistView;
