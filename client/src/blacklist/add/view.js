var Backbone = require('backbone');
var Form = require('../../common/views/formWithErrorHandling');
require('backbone.syphon');
var $ = require('jquery');
var moment = require('moment');
require('bootstrap-datetimepicker');

var Blacklist = require('../models/blacklist');

var FormView = Form.extend({
  template: require('./template.hbs'),
  idPrefix: 'blacklist',
  
  ui: Form.extendUi({
    'from': '#blacklist-from',
    'for': '#blacklist-for'
  }),

  onRender: function () {
    this.ui.from.datetimepicker({
      pickTime: false
    });
    this.ui.from.data("DateTimePicker").setDate(moment.utc());

    this.ui.for.val(this.model.get('for'));
  }

});

module.exports = FormView;
