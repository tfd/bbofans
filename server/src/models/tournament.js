/* jshint -W097 */
"use strict";

/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');
var logger = require('../utils/logger');

/*
 * Tournament Schema
 */

var TournamentSchema = new Schema({
  name      : {type: String, required: 'Tournament name cannot be blank', trim: true, unique: true},
  date      : {type: Date, default: Date.now},
  resultsUrl: {type: String, default: ''},
  boardsUrl : {type: String, default: ''},
  numPlayers: {type: Number, required: 'Number of players cannot be blank', min: [4, 'Number of players must be at least {MIN}']},
  isPair    : {type: Boolean, default: false},
  isRbd     : {type: Boolean, default: false},
  results   : [{
                 players: [{type: String}],
                 score  : {type: Number, default: 0},
                 awards : {type: Number, default: 0}
               }],
  createdAt : {type: Date, default: Date.now}
});

/*
 * Helper methods
 */

function addScoreToMember(tournament, callback) {
  return function (err, member) {
    if (err) {
      logger.error('Could not find member', err);
      callback(); // ignore error!
      return;
    }

    if (member) {
      try {
        member.addTournament(tournament);
        member.save(callback);
        return;
      }
      catch (e) {
        logger.error('Exception thrown when adding scores for tournament ' + tournament.name + ' to member ' +
                    member.bboName, e);
      }
    }

    callback();
  };
}

function processPlayer(tournament) {
  var Member = mongoose.model('Member');
  return function (bboName, callback) {
    var re = new RegExp('^' + bboName + '$', 'i');
    Member.findOne({bboName: re}, addScoreToMember(tournament, callback));
  };
}

function processResult(tournament) {
  return function (result, callback) {
    async.eachSeries(result.players, processPlayer(tournament), callback);
  };
}

function addTournamentToPlayers(tournament, callback) {
  async.eachSeries(tournament.results, processResult(tournament), callback);
}

/*
 * Methods
 */

TournamentSchema.methods = {

  playedInTournament: function (bboName) {
    return this.findPlayerScores(bboName) !== null;
  },

  findPlayerScores: function (bboName) {
    var score = null;
    var test = bboName.toLowerCase();

    this.results.every(function (result) {
      var found = false;

      result.players.every(function (name) {
        if (name.toLowerCase() === test) {
          found = true;
          return false;
        }
        return true;
      });

      if (found) {
        score = result;
        return false;
      }
      return true;
    });

    return score;
  }

};

TournamentSchema.statics.addTournament = function (tournament, cb) {
  var Tournament = mongoose.model('Tournament');

  Tournament.findOne({name: tournament.name.trim()}, function (err, t) {
    if (err) {
      logger.error('Tournament.addTournament', err);
      return cb(err, null);
    }

    if (t) {
      // tournament already added, just skip
      logger.log('Tournament.addTournament', 'Tournament "' + t.name + '" already added');
      return cb(null, t);
    }

    try {
      var newTournament = new Tournament(tournament);
      newTournament.save(function (err, tournament) {
        if (err) {
          logger.error('Tournament.addTournament', err);
          return cb({error: 'Error adding Tournament.'}, null);
        }

        return addTournamentToPlayers(tournament, cb);
      });
    }
    catch (e) {
      logger.error('Exception thrown when adding tournament ' + tournament.name, e);
      cb({error: 'Exception ' + e.message}, null);
    }
  });
};

module.exports = mongoose.model('Tournament', TournamentSchema);
