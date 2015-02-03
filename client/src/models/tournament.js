/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var _ = require('underscore');
var moment = require('moment');

var Tournament = Backbone.Model.extend({
  idAttribute: "_id",

  defaults: {
    name: '',
    date: moment.utc(),
    numPlayers: 0,
    isPair: false,
    isRbd: false,
    resultsUrl: '',
    boardsUrl: '',
    results: []
  },

  validate: function(attrs) {
    var errors = {};
    if (! attrs.name) {
      errors.name = "can't be blank";
    }
    if (! attrs.numPlayers ) {
      errors.numPlayers = "can't be 0";
    }
    if( ! _.isEmpty(errors)){
      return errors;
    }
  }
});

module.exports = Tournament;
