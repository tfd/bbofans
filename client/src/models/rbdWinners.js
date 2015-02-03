"use strict";

var WinnerCollection = require('./winnerCollection');
var messageBus = require('../common/router/messageBus');

var RbdWinners = WinnerCollection.extend({
  url: "winners/rbd"
});

messageBus.reply('winners.rbd', function (month, year) {
  var winners = new RbdWinners();
  if (month && year) {
    winners.fetch({data: {month: month, year: year}, reset: true});
  }
  else {
    winners.fetch({reset: true});
  }
  return winners;
});

module.exports = RbdWinners;