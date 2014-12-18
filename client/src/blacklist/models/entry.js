var Backbone = require('backbone');
var moment = require('moment');

Entry = Backbone.Model.extend({
  idAttribute: "_id",
  
  defaults: {
    'from': moment(),
    'to': moment().add(6, 'D'),
    reason: ""
  }
});

module.exports = Entry;
