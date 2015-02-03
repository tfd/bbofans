/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var LeagueController = require('./leagueController');

var RockController = LeagueController.extend({
  Collection: require('../../models/rockWinners'),
  View: require('./rockView')
});

module.exports = RockController;
