
/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseTypes = require("nifty-mongoose-types");

/*
 * Tournament Schema
 */

var TournamentSchema = new Schema({
  name          : {type : String, required : 'Tournament name cannot be blank', trim : true, unique: true},
  date          : {type : Date, default : Date.now},
  numPlayers    : {type : Number, required : 'Number of players cannot be blank', min: [4, 'Number of players must be at least {MIN}'] },
  isPair        : {type : Boolean, default : false},
  isRbd         : {type : Boolean, default : false},
  results       : [{
    players       : [{type : String}],
    score         : {type : Number, default : 0 },
    awards        : {type : Number, default : 0 }}],
  createdAt     : {type : Date, default : Date.now}
});


/*
 * Methods
 */

TournamentSchema.methods = {

  playedInTournament: function (bboName) {
    return this.findPlayerScores(bboName) !== null;
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

module.exports = mongoose.model('Tournament', TournamentSchema);
