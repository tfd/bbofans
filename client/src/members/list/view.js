/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var $ = require('jquery');
var _ = require('underscore');

require('bootstrap-table-filter');
require('../../common/table/bootstrap-table-colgroups');
require('../../common/table/bootstrap-table-commands');
require('../../common/table/bootstrap-table-remote-export');
require('../../common/utils/formatHelpers');

function setFilter(filter, options) {
  filter.bootstrapTableFilter('disableFilters');
  _.each(options, function (value, key) {
    filter.bootstrapTableFilter('unselectFilterOption', key, 'false');
    filter.bootstrapTableFilter('unselectFilterOption', key, 'true');
    filter.bootstrapTableFilter('setupFilter', key, value);
  });
  filter.find('.btn-refresh').click();
}

var MembersView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    table    : "table#list-members",
    filter   : "#filter-bar",
    create   : '.form-create',
    all      : '.form-all',
    enabled  : '.form-enabled',
    rock     : '.form-rock',
    rbd      : '.form-rbd',
    validate : '.form-validate',
    blacklist: '.form-blacklist',
    banned   : '.form-banned'
  },

  events: {
    'click @ui.create'   : 'onCreateClicked',
    'click @ui.all'      : 'onAllClicked',
    'click @ui.enabled'  : 'onEnabledClicked',
    'click @ui.rock'     : 'onRockClicked',
    'click @ui.rbd'      : 'onRbdClicked',
    'click @ui.validate' : 'onValidateClicked',
    'click @ui.blacklist': 'onBlacklistedClicked',
    'click @ui.banned'   : 'onBannedClicked'
  },

  triggers: {
    'click @ui.create': 'members:create'
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
      rowStyle   : function (item) {
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
          source: '/admin/members/bboNames'
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
    setFilter(this.ui.filter, {});
  },

  onEnabledClicked: function () {
    setFilter(this.ui.filter, {
      isEnabled: {_values: ['true']}
    });
  },

  onRockClicked: function () {
    setFilter(this.ui.filter, {
      isEnabled    : {_values: ['true']},
      isBlackListed: {_values: ['false']},
      isBanned     : {_values: ['false']},
      isRbdPlayer  : {_values: ['false']}
    });
  },

  onRbdClicked: function () {
    setFilter(this.ui.filter, {
      isEnabled    : {_values: ['true']},
      isBlackListed: {_values: ['false']},
      isBanned     : {_values: ['false']},
      isRbdPlayer  : {_values: ['true']}
    });
  },

  onValidateClicked: function () {
    setFilter(this.ui.filter, {
      validatedAt: {_values: ['true']}
    });
  },

  onBlacklistedClicked: function () {
    setFilter(this.ui.filter, {
      isBlackListed: {_values: ['true']}
    });
  },

  onBannedClicked: function () {
    setFilter(this.ui.filter, {
      isBanned: {_values: ['true']}
    });
  }

});

module.exports = MembersView;
