/* jshint -W097 */
"use strict";

var moment = require('moment');
var Handlebars = require("hbsfy/runtime");

window.bsTable = window.bsTable || {};
window.bsTable.formatters = window.bsTable.formatters || {
  boolean: function (value) {
    if (value === true) {
      return '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
    }
    return "";
  },

  date: function (value) {
    var d = moment.utc(value);
    return d.isValid() ? d.format('L') : '';
  },

  percentage: function (value) {
    var v = parseFloat(value);
    return v.toFixed(2) + '%';
  },

  float: function (value) {
    var v = parseFloat(value);
    return v.toFixed(2);
  }
};

Handlebars.registerHelper('formatDate', function(val) {
  return window.bsTable.formatters.date(val);
});

Handlebars.registerHelper('formatBoolean', function(val) {
  return window.bsTable.formatters.boolean(val);
});

Handlebars.registerHelper('formatPercentage', function (val) {
  return window.bsTable.formatters.percentage(val);
});

Handlebars.registerHelper('formatFloat', function (val) {
  return window.bsTable.formatters.float(val);
});

Handlebars.registerPartial('displayBboName', require('./displayBboName.hbs'));

module.exports = window.bsTable;
