/* jshint -W097 */
"use strict";

module.exports = {
  systems: require('../../data/awardSystems'),

  /**
   * Return the calculation system used for a tournament with the given number of players.
   *
   * @param {String} type - type of tournaments, one of 'rock' or 'rbd'.
   * @param {Number} numPlayers - number of players in tournament
   * @returns {Object} the system used for this tournament,
   */
  getSystem: function (type, numPlayers) {
    var i;
    var systems = this.systems[type];
    for (i = 0; i < systems.length; i++) {
      if (numPlayers >= systems[i].numPlayers[0] && numPlayers <= systems[i].numPlayers[1]) {
        return systems[i];
      }
    }
    return null;
  },

  /**
   * Return the awards points for the given position in the given system.
   *
   * @param {Object} system - the calculation system used.
   * @param {Numner} pos - position, starting from 0
   * @returns {number} the number of awards points
   */
  getAwardPoints: function (system, pos) {
    var i;
    for (i = 0; i < system.awards.length; i++) {
      if (pos < system.awards[i].position) {
        return system.awards[i].points;
      }
    }
    return 0;
  }
};
