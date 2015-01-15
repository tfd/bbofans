/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var $ = require('jquery');
require('bootstrap-table-filter');
require('../../common/table/bootstrap-table-colgroups');
require('../../common/table/bootstrap-table-commands');
require('../../common/table/bootstrap-table-remote-export');
require('../../common/utils/formatHelpers');

var MembersView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    table   : "table",
    filter  : "#filter-bar",
    all     : '.form-all',
    rock    : '.form-rock',
    rbd     : '.form-rbd',
    validate: '.form-validate'
  },

  events: {
    'click @ui.all'     : 'onAllClicked',
    'click @ui.rock'    : 'onRockClicked',
    'click @ui.rbd'     : 'onRbdClicked',
    'click @ui.validate': 'onValidateClicked'
  },

  reloadTable: function () {
    this.$el.find(this.ui.table).bootstrapTable('refresh');
  },

  onRender: function () {
    var self = this;
    this.filterData = undefined;

    this.ui.table.bootstrapTable({
      queryParams: function (params) {
        if (self.filterData) {
          params.filter = JSON.stringify(self.filterData);
        }
        return params;
      },
      rowStyle   : function (item, i) {
        if (item.isBanned) {
          return {classes: 'bg-danger'};
        }
        if (item.isBlackListed) {
          return {classes: 'bg-warning'};
        }
        if (item.registeredAt === null || item.registeredAt === undefined) {
          return {classes: 'bg-info'};
        }
        if (item.validatedAt === null || item.validatedAt === undefined) {
          return {classes: 'bg-success'};
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
      filters : [
        {
          field : 'bboName',
          label : 'BBO Name',
          type  : 'ajaxSelect',
          source: '/admin/members/bboName'
        },
        {
          field: 'name',
          label: 'Name',
          type : 'search'
        },
        {
          field: 'email',
          label: 'EMail',
          type : 'search'
        },
        {
          field : 'level',
          label : 'Level',
          type  : 'select',
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
          field : 'validatedAt',
          label : 'To validate',
          type  : 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field : 'role',
          label : 'Role',
          type  : 'select',
          values: [
            {id: 'admin', label: 'Admin'},
            {id: 'blacklist manager', label: 'Blacklist Manager'},
            {id: 'td manager', label: 'TD Manager'},
            {id: 'td', label: 'TD'},
            {id: 'member', label: 'Member'}
          ]
        },
        {
          field : 'isEnabled',
          label : 'Enabled',
          type  : 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field : 'isStarPlayer',
          label : 'Star Player',
          type  : 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field : 'isRbdPlayer',
          label : 'RBD Player',
          type  : 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field : 'isBlackListed',
          label : 'Blacklisted',
          type  : 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field : 'isBanned',
          label : 'Banned',
          type  : 'select',
          values: [
            {id: 'true', label: 'Yes'},
            {id: 'false', label: 'No'}
          ]
        },
        {
          field : 'nation',
          label : 'Country',
          type  : 'ajaxSelect',
          source: '/countries'
        },
        {
          field: 'rockNumTournaments',
          label: 'Rock n° Tournaments',
          type : 'range'
        },
        {
          field: 'rockAverageScore',
          label: 'Rock Average Match Points',
          type : 'range'
        },
        {
          field: 'rockAwards',
          label: 'Rock Awards',
          type : 'range'
        },
        {
          field: 'rbdNumTournaments',
          label: 'RBD n° Tournaments',
          type : 'range'
        },
        {
          field: 'rbdAverageScore',
          label: 'RBD Average IMPs',
          type : 'range'
        },
        {
          field: 'rbdAwards',
          label: 'RBD Awards',
          type : 'range'
        }
      ],
      onSubmit: function () {
        self.filterData = self.ui.filter.bootstrapTableFilter('getData');
        self.ui.table.bootstrapTable('refresh');
      }
    });
  },

  onShow: function () {
    var filter = this.ui.filter;
    $(this.ui.table).one('load-success.bs.table', function () {
      // Wait for first table load before setting the filter, because refreshing the table while it is still loading
      // produces a race condition.
      filter.bootstrapTableFilter('setupFilter', 'isEnabled', {_values: ['true']});
      filter.find('.btn-refresh').click();
    });
  },

  onAllClicked: function () {
    var filter = this.ui.filter;
    filter.bootstrapTableFilter('disableFilters');
    filter.bootstrapTableFilter('unselectFilterOption', 'isEnabled', 'false');
    filter.bootstrapTableFilter('setupFilter', 'isEnabled', {_values: ['true']});
    filter.find('.btn-refresh').click();
  },

  onRockClicked: function () {
    var filter = this.ui.filter;
    filter.bootstrapTableFilter('disableFilters');
    filter.bootstrapTableFilter('unselectFilterOption', 'isEnabled', 'false');
    filter.bootstrapTableFilter('unselectFilterOption', 'isBlackListed', 'true');
    filter.bootstrapTableFilter('unselectFilterOption', 'isBanned', 'true');
    filter.bootstrapTableFilter('unselectFilterOption', 'isRbdPlayer', 'true');
    filter.bootstrapTableFilter('setupFilter', 'isEnabled', {_values: ['true']});
    filter.bootstrapTableFilter('setupFilter', 'isBlackListed', {_values: ['false']});
    filter.bootstrapTableFilter('setupFilter', 'isBanned', {_values: ['false']});
    filter.bootstrapTableFilter('setupFilter', 'isRbdPlayer', {_values: ['false']});
    filter.find('.btn-refresh').click();
  },

  onRbdClicked: function () {
    var filter = this.ui.filter;
    filter.bootstrapTableFilter('disableFilters');
    filter.bootstrapTableFilter('unselectFilterOption', 'isEnabled', 'false');
    filter.bootstrapTableFilter('unselectFilterOption', 'isBlackListed', 'true');
    filter.bootstrapTableFilter('unselectFilterOption', 'isBanned', 'true');
    filter.bootstrapTableFilter('unselectFilterOption', 'isRbdPlayer', 'false');
    filter.bootstrapTableFilter('setupFilter', 'isEnabled', {_values: ['true']});
    filter.bootstrapTableFilter('setupFilter', 'isBlackListed', {_values: ['false']});
    filter.bootstrapTableFilter('setupFilter', 'isBanned', {_values: ['false']});
    filter.bootstrapTableFilter('setupFilter', 'isRbdPlayer', {_values: ['true']});
    filter.find('.btn-refresh').click();
  },

  onValidateClicked: function () {
    var filter = this.ui.filter;
    filter.bootstrapTableFilter('disableFilters');
    filter.bootstrapTableFilter('unselectFilterOption', 'validatedAt', 'false');
    filter.bootstrapTableFilter('setupFilter', 'validatedAt', {_values: ['true']});
    filter.find('.btn-refresh').click();
  }

});

module.exports = MembersView;
