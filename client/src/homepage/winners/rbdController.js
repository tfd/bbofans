/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var LeagueController = require('./leagueController');

var RbdController = LeagueController.extend({
  Collection: require('../../models/rbdWinners'),
  View: require('./rbdView')
});

module.exports = RbdController;
