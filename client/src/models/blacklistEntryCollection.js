/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var BlacklistEntry = require('./blacklistEntry');

var BlacklistEntryCollection = Backbone.Collection.extend({
  model: BlacklistEntry
});

module.exports = BlacklistEntryCollection;
