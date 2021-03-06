/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var moment = require('moment');

var BlacklistEntry = Backbone.Model.extend({
  idAttribute: "_id",
  
  defaults: {
    td: '',
    'from': moment().toDate(),
    'to': moment().add(6, 'D').toDate(),
    reason: ''
  }
});

module.exports = BlacklistEntry;
