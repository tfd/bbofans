
/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseTypes = require("nifty-mongoose-types");
var useTimestamps = mongooseTypes.useTimestamps;

/*
 * Tournament Schema
 */

var TournamentSchema = new Schema({
  name          : {type : String, required: 'Tournament name cannot be blank', trim : true, unique: true},
  date          : {type : Date, default: Date.now},
  numPlayers    : {type : Number, required: 'Number of players cannout be blank', min: [4, 'Number of players must be at least value {MIN}'] },
  isPair        : {type : Boolean, default : false},
  isBD          : {type : Boolean, default : false},
  results       : [{
    players       : [{type : String}],
    score         : {type : Number, default : 0 },
    matchPoints   : {type : Number, default : 0 },
    awards        : {type : Number, default : 0 }}]
});


/*
 * Methods
 */

TournamentSchema.methods = {

  playedInTournament: function (bboName) {
    return findPlayerScores(bboName) !== null;
  },

  findPlayerScores: function (bboName) {
    var score = null;

    this.results.every(function (result) {
      if (result.players.indexOf(bboName) >= 0) {
        score = result;
        return false;
      }
      return true;
    });

    return score;
  }

};

// add createdAd and updatedAd fields
TournamentSchema.plugin(useTimestamps);

module.exports = {
    Tournament: mongoose.model('Tournament', TournamentSchema)
};
