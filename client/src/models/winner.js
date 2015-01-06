/* jshint -W097 */
"use strict";

var Backbone = require('backbone');

var Winner = Backbone.Model.extend({
  idAttribute: "_id",

  defaults: {
    'bboName': '',
    'awards': 0,
    'averageScore': 0
  }
});

module.exports = Winner;
