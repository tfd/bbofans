/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var FormWithErrorHandling = require('../../common/views/formWithErrorHandling');

var MemberNewView = FormWithErrorHandling.extend({
  template: require('./template.hbs'),
  idPrefix: 'new',

  ui: FormWithErrorHandling.extendUi({
    typeAhead: '#new-bboName'
  }),

  onRender: function () {
    var engine = new Bloodhound({
      name          : 'members',
      remote        : '/admin/members/bboNames?bloodhound=true&q=%QUERY',
      datumTokenizer: function (d) {
        return d.val ? [d.val] : [];
      },
      queryTokenizer: function (str) {
        return str ? [str] : [];
      }
    });
    engine.initialize();

    this.ui.typeAhead.typeahead(null, {
      name      : 'new-bboName',
      displayKey: 'bboName',
      source    : engine.ttAdapter()
    });
  }

});

module.exports = MemberNewView;
