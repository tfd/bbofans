/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Tournament = require('./tournament');
var messageBus = require('../common/router/messageBus');

var TournamentCollection = Backbone.Collection.extend({
  url: "tournaments",
  model: Tournament
});

messageBus.reply('tournaments.tail', function (num) {
  var tournaments = new TournamentCollection();
  tournaments.fetch({data: {offset: 0, limit: num || 10, sort: 'date', order: 'desc'}, reset: true});
  return tournaments;
});

module.exports = TournamentCollection;
