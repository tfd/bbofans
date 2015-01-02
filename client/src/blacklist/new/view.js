var FormWithErrorHandling = require('../../common/views/formWithErrorHandling.js');
var Bloodhound = require('typeAhead');
var moment = require('moment');
require('bootstrap-dateTimePicker');

var Blacklist = require('../../models/blacklist');

var BlacklistNewView = FormWithErrorHandling.extend({
  template   : require('./template.hbs'),
  idPrefix   : 'blacklist',

  ui: FormWithErrorHandling.extendUi({
    'from'     : '#blacklist-from',
    'for'      : '#blacklist-for',
    'typeAhead': '#blacklist-bboName'
  }),

  onRender: function () {
    var engine = new Bloodhound({
      name          : 'members',
      remote        : '/admin/members/bboName?q=%QUERY',
      datumTokenizer: function (d) {
        return d.val ? [d.val] : [];
      },
      queryTokenizer: function (str) {
        return str ? [str] : [];
      }
    });
    engine.initialize();

    this.ui.typeAhead.typeahead(null, {
      name      : 'member-bboName',
      displayKey: 'bboName',
      source    : engine.ttAdapter()
    });
    //.on('typeahead:opened',function(){$('.tt-dropdown-menu').css('width',$(this).width() + 'px');

    this.ui.from.datetimepicker({pickTime: false});
    this.ui.from.data("DateTimePicker").setDate(moment.utc());

    this.ui.for.val(this.model.get('for'));
  }

});

module.exports = BlacklistNewView;
