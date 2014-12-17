var moment = require('moment');

window.bsTable = window.bsTable || {};
window.bsTable.formatters = window.bsTable.formatters || {
  boolean: function (value) {
    if (value === true) {
      return '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
    }
    return "";
  },

  date: function (value) {
    var d = moment(value);
    return d.isValid() ? d.format('DD/MM/YYYY') : "";
  }
}; 

module.exports = window.bsTable;
