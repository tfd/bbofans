/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var Bloodhound = require('typeAhead');
var Form = require('../form/view');
var moment = require('moment');
require('bootstrap-dateTimePicker');

var Blacklist = require('../../models/blacklist');

var BlacklistRemoveView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),

  regions: {
    'form': '#blacklist-form'
  },

  onRender: function () {
    var self = this;

    this.model.set('blacklisting', 'whitelisting');
    this.model.set('createLabel', 'remove from blacklist');
    this.formView = new Form({model: this.model});
    this.form.show(this.formView);

    var engine = new Bloodhound({
      name          : 'blacklist',
      remote        : '/admin/blacklist/bboNames?bloodhound=true&q=%QUERY',
      datumTokenizer: function (d) {
        return d.val ? [d.val] : [];
      },
      queryTokenizer: function (str) {
        return str ? [str] : [];
      }
    });
    engine.initialize();

    this.formView.ui.typeAhead.typeahead(null, {
      name      : 'blacklist-bboName',
      displayKey: 'bboName',
      source    : engine.ttAdapter()
    });
    //.on('typeahead:opened',function(){$('.tt-dropdown-menu').css('width',$(this).width() + 'px');

    this.formView.on('form:submit', function (data) {
      self.triggerMethod('form:submit', data);
    });

    this.formView.on('form:cancel', function () {
      self.triggerMethod('form:cancel');
    });

    this.formView.on('form:close', function () {
      self.triggerMethod('form:close');
    });

  }

});

module.exports = BlacklistRemoveView;
