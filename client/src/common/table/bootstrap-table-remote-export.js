/**
 * Adapted from:
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * extensions: https://github.com/kayalshri/tableExport.jquery.plugin
 */

var $ = require('jquery');
var _ = require('underscore');

var TYPE_NAME = {
  json: 'JSON',
  xml : 'XML',
  csv : 'CSV',
  txt : 'TXT'
};

$.extend($.fn.bootstrapTable.defaults, {
  showExport : false,
  exportTypes: ['json', 'xml', 'csv', 'txt']
});

var BootstrapTable = $.fn.bootstrapTable.Constructor;
var _initToolbar = BootstrapTable.prototype.initToolbar;

function calculateObjectValue (self, name, args, defaultValue) {
  if (typeof name === 'string') {
    // support obj.func1.func2
    var names = name.split('.');

    if (names.length > 1) {
      name = window;
      $.each(names, function (i, f) {
        name = name[f];
      });
    }
    else {
      name = window[name];
    }
  }
  if (typeof name === 'object') {
    return name;
  }
  if (typeof name === 'function') {
    return name.apply(self, args);
  }
  return defaultValue;
}

BootstrapTable.prototype.initToolbar = function () {
  _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

  if (this.options.showExport) {
    var self = this,
        $btnGroup = this.$toolbar.find('>.btn-group'),
        $export = $btnGroup.find('div.export');

    if (!$export.length) {
      $export = $([
        '<div class="export btn-group">',
        '<button class="btn btn-default dropdown-toggle" ' +
        'data-toggle="dropdown" type="button">',
        '<i class="glyphicon glyphicon-export icon-share"></i> ',
        '<span class="caret"></span>',
        '</button>',
        '<ul class="dropdown-menu" role="menu">',
        '</ul>',
        '</div>'].join('')).appendTo($btnGroup);

      var $dropDown = $export,
          $menu = $export.find('.dropdown-menu'),
          exportTypes = this.options.exportTypes;

      if (typeof this.options.exportTypes === 'string') {
        var types = this.options.exportTypes.slice(1, -1).replace(/ /g, '').split(',');

        exportTypes = [];
        _.each(types, function (value) {
          exportTypes.push(value.slice(1, -1));
        });
      }
      _.each(exportTypes, function (type) {
        if (TYPE_NAME.hasOwnProperty(type)) {
          $menu.append(['<li data-type="' + type + '">',
                        '<a href="javascript:void(0)">',
                        TYPE_NAME[type],
                        '</a>',
                        '</li>'].join(''));
        }
      });

      $dropDown.on('show.bs.dropdown', function () {
        var data = {},
            params = {
              searchText: self.searchText,
              sortName  : self.options.sortName,
              sortOrder : self.options.sortOrder
            };

        if (!self.options.exportUrl) {
          return;
        }

        if (self.options.queryParamsType === 'limit') {
          params = {
            search: params.searchText,
            sort  : params.sortName,
            order : params.sortOrder
          };
        }
        data = calculateObjectValue(self.options, self.options.queryParams, [params], data);
        var qs = '?' + $.param(data);

        $menu.find('li').each(function () {
          $(this).find('a').attr('href', self.options.exportUrl + '/' + $(this).data('type') + qs);
        });
      });
    }
  }
};
