"use strict";

var WinnerCollection = require('./winnerCollection');
var messageBus = require('../common/router/messageBus');

var RockWinnerCollection = WinnerCollection.extend({
  url: "winners/rock"
});

messageBus.reply('winners.rock', function (month, year) {
  var winners = new RockWinnerCollection();
  if (month && year) {
    winners.fetch({data: {month: month, year: year}, reset: true});
  }
  else {
    winners.fetch({reset: true});
  }
  return winners;
});

module.exports = RockWinnerCollection;