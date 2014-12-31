var $ = require('jquery');

$.extend($.fn.bootstrapTable.defaults, {
  showColumnGroups: false,
  // 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'powerpoint', 'pdf'
  columnGroups    : {
    'general info': ['select', 'bboName', 'registeredAt', 'name', 'nation', 'email', 'level', 'isEnabled'],
    'status'      : ['select',
                     'bboName',
                     'email',
                     'role',
                     'isEnabled',
                     'isStarPlayer',
                     'isRbdPlayer',
                     'isBlackListed',
                     'isBanned'],
    'rock scores' : ['select',
                     'bboName',
                     'rockNumTournaments',
                     'rockLastPlayedAt',
                     'rockAverageScore',
                     'rockAwards'],
    'rbd scores'  : ['select',
                     'bboName',
                     'isRbdPlayer',
                     'rbdNumTournaments',
                     'rbdLastPlayedAt',
                     'rbdAverageScore',
                     'rbdAwards']
  }
});

var BootstrapTable = $.fn.bootstrapTable.Constructor;
var _initToolbar = BootstrapTable.prototype.initToolbar;

BootstrapTable.prototype.initToolbar = function () {
  _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

  if (this.options.showColumnGroups) {
    var that = this,
        $btnGroup = this.$toolbar.find('>.btn-group'),
        $columnGroup = $btnGroup.find('div.columnGroup');

    if (!$columnGroup.length) {
      $columnGroup = $([
        '<div class="column-group btn-group" title="Column Groups">',
        '<button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">',
        '<i class="glyphicon glyphicon-th-list icon-th-list"></i> ',
        '<span class="caret"></span>',
        '</button>',
        '<ul class="dropdown-menu" role="menu">',
        '</ul>',
        '</div>'].join('')).appendTo($btnGroup);

      var $menu = $columnGroup.find('.dropdown-menu'),
          columnGroups = this.options.columnGroups;

      $.each(columnGroups, function (key, value) {
        $menu.append(['<li data-column-group="' + key + '">',
                      '<a href="javascript:void(0)">',
                      key,
                      '</a>',
                      '</li>'].join(''));
      });

      $menu.find('li').click(function () {
        var group = $(this).data('column-group');
        var fields = that.options.columnGroups[group];

        $.each(that.options.columns, function (i, column) {
          if (fields.indexOf(column.field) >= 0) {
            that.showColumn(column.field);
            that.trigger('column-switch', column.field, true);
          }
          else {
            that.hideColumn(column.field);
            that.trigger('column-switch', column.field, false);
          }
        });
      });
    }
  }
};
