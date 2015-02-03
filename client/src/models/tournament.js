/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var _ = require('underscore');
var moment = require('moment');
var messageBus = require('../common/router/messageBus');

var Tournament = Backbone.Model.extend({
  urlRoot: "admin/tournaments",
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

messageBus.reply('tournaments:tail:10', function () {
  var tournaments = new Backbone.Collection({model: Tournament});
  tournaments.fetch({data: {offset: 0, limit: 10, order: 'date', sort: 'desc'}, reset: true});
  return tournaments;
});

module.exports = Tournament;
