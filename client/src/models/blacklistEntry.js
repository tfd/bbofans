var Backbone = require('backbone');
var moment = require('moment');

var BlacklistEntry = Backbone.Model.extend({
  idAttribute: "_id",
  
  defaults: {
    'from': moment().toDate(),
    'to': moment().add(6, 'D').toDate(),
    reason: ''
  }
});

module.exports = BlacklistEntry;