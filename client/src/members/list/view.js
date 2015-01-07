/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
require('bootstrap-table-filter');
require('../../common/table/bootstrap-table-colgroups');
require('../../common/table/bootstrap-table-commands');
require('../../common/table/bootstrap-table-remote-export');
require('../../common/utils/formatHelpers');

var MembersView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    table: "table",
    filter: "#filter-bar"
  },

  reloadTable: function () {
    this.$el.find(this.ui.table).bootstrapTable('refresh');
  },

  onRender: function() {
    var self = this;
    this.filterData = undefined;

    this.ui.table.bootstrapTable({
      queryParams: function (params) {
        if (self.filterData) {
          params.filter = JSON.stringify(self.filterData);
        }
        return params;
      },
      rowStyle: function (item, i) {
        if (item.isBanned) {
          return { classes: 'bg-danger' };
        }
        if (item.isBlackListed) {
          return { classes: 'bg-warning'};
        }
        if (item.registeredAt === null || item.registeredAt === undefined) {
          return { classes: 'bg-info'};
        }
        if (item.validatedAt === null || item.validatedAt === undefined) {
          return { classes: 'bg-success'};
        }
        
        return {};
      }
    }).on('click-row.bs.table', function (e, row, $el) {
      e.preventDefault();
      self.trigger('members:edit', row._id);
    }).on('command.bs.table', function (e, command) {
      var rows = self.ui.table.bootstrapTable('getSelections');
      self.trigger('members:command', command, rows);
    });
    
    this.ui.filter.bootstrapTableFilter({
      filters:[
        {
          field: 'bboName',
          label: 'BBO Name',
          type: 'ajaxSelect',
          source: '/admin/members/bboName'
        },
        {
          field: 'name',
          label: 'Name',
          type: 'search'
        },
        {
          field: 'email',
          label: 'EMail',
          type: 'search'
        },
        {
          field: 'level',
          label: 'Level',
          type: 'select',
          values: [
            {id: 'Beginner', label: 'Beginner'},
            {id: 'Intermediate', label: 'Intermediate'},
            {id: 'Advanced', label: 'Advanced'},
            {id: 'Expert', label: 'Expert'},
            {id: 'Champion', label: 'Champion'},
            {id: 'World Class', label: 'World Class'}
          ]
        },
        {
          field: 'validatedAt',
          label: 'To validate',
          type: 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field: 'role',
          label: 'Role',
          type: 'select',
          values: [
            {id: 'admin', label: 'Admin'},
            {id: 'blacklist manager', label: 'Blacklist Manager'},
            {id: 'td manager', label: 'TD Manager'},
            {id: 'td', label: 'TD'},
            {id: 'member', label: 'Member'}
          ]
        },
        {
          field: 'isEnabled',
          label: 'Enabled',
          type: 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field: 'isStarPlayer',
          label: 'Star Player',
          type: 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field: 'isRbdPlayer',
          label: 'RBD Player',
          type: 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field: 'isBlackListed',
          label: 'Blacklisted',
          type: 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field: 'isBanned',
          label: 'Banned',
          type: 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field: 'nation',
          label: 'Country',
          type: 'ajaxSelect',
          source: '/countries'
        },
        {
          field: 'rockNumTournaments',
          label: 'Rock n° Tournaments',
          type: 'range'
        },
        {
          field: 'rockAverageScore',
          label: 'Rock Average Match Points',
          type: 'range'
        },
        {
          field: 'rockAwards',
          label: 'Rock Awards',
          type: 'range'
        },
        {
          field: 'rbdNumTournaments',
          label: 'RBD n° Tournaments',
          type: 'range'
        },
        {
          field: 'rbdAverageScore',
          label: 'RBD Average IMPs',
          type: 'range'
        },
        {
          field: 'rbdAwards',
          label: 'RBD Awards',
          type: 'range'
        }
      ],
      onSubmit: function() {
        self.filterData = self.ui.filter.bootstrapTableFilter('getData');
        self.ui.table.bootstrapTable('refresh');
      }
    });
  }
});

module.exports = MembersView;
