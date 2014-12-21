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
  }
}; 

Handlebars.registerHelper("formatDate", function(val) {
  return window.bsTable.formatters.date(val);
});

Handlebars.registerHelper("formatBoolean", function(val) {
  return window.bsTable.formatters.boolean(val);
});

module.exports = window.bsTable;
