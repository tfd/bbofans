
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseTypes = require("nifty-mongoose-types");
var useTimestamps = mongooseTypes.useTimestamps;

/**
 * Tournament Schema
 */

var TournamentSchema = new Schema({
  name          : {type : String, required: 'Tournament name cannot be blank', trim : true, unique: true},
  date          : {type : Date, default: Date.now},
  numPlayers    : {type : Number, required: 'Number of players cannout be blank', min: [4, 'Number of players must be at least value {MIN}'] },
  isPair        : {type : Boolean, default : false},
  isBD          : {type : Boolean, default : false},
  results       : [{
    players       : [{type : Schema.Types.ObjectId, ref : 'Player'}],
    score         : {type : Number, default : 0 },
    matchPoints   : {type : Number, default : 0 },
    awards        : {type : Number, default : 0 }}]
});


/**
 * Methods
 */

TournamentSchema.methods = {

  playedInTournament: function (player) {
    return findPlayerScores(player) !== null;
  }

  findPlayerScores: function (player) {
    var score = null;

    this.results.every(function (result) {
      var arr = result.populated('players') || result.players;
      if (arr.indexOf(player.id) >= 0) {
        score = result;
        return false;
      }
      return true;
    });

    return score;
  }

};

TournamentSchema.plugin(useTimestamps);

module.exports = {
    Tournament: mongoose.model('Tournament', TournamentSchema)
};
