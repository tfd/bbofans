var $ = require('jquery');

$.extend($.fn.bootstrapTable.defaults, {
  showCommands: false,
  commands    : {},
  onCommand   : function (command) { return false; }
});

$.extend($.fn.bootstrapTable.Constructor.EVENTS, {
  'command.bs.table': 'onCommand'
});

var BootstrapTable = $.fn.bootstrapTable.Constructor;
var _initToolbar = BootstrapTable.prototype.initToolbar;

var getFunction = function (name) {
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
  return name;
};

BootstrapTable.prototype.initToolbar = function () {
  _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

  if (this.options.showCommands) {
    var that = this,
        $btnGroup = this.$toolbar.find('>.btn-group'),
        $commandsButton = $btnGroup.find('div.commands');

    if (!$commandsButton.length) {
      $commandsButton = $([
        '<div class="commands btn-group" title="Commands">',
        '<button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">',
        '<i class="glyphicon glyphicon-wrench icon-wrench"></i> ',
        '<span class="caret"></span>',
        '</button>',
        '<ul class="dropdown-menu" role="menu">',
        '</ul>',
        '</div>'].join('')).appendTo($btnGroup);

      var $menu = $commandsButton.find('.dropdown-menu'),
          commands = this.options.commands.replace(/\s/g, '').split(',');

      $.each(commands, function (i, value) {
        $menu.append(['<li data-command-type="' + value + '">',
                      '<a href="javascript:void(0)">',
                      value,
                      '</a>',
                      '</li>'].join(''));
      });

      $menu.find('li').click(function () {
        var command = $(this).data('command-type');
        that.trigger('command', command);
      });
    }
  }
};

