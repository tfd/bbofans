/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Winner = require('./winner');

var WinnerCollection = Backbone.Collection.extend({
  model: Winner
});

module.exports = WinnerCollection;
