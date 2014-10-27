
/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;
var mongooseTypes = require("nifty-mongoose-types");
mongooseTypes.loadTypes(mongoose);
var Email = mongoose.SchemaTypes.Email;

/*
 * Player Schema
 */

var emailValidator = [validate({
    validator: 'isEmail',
    message: 'Email isn\'t a valid address'
  }),
  validate({
    validator: 'isLength',
    arguments: 1,
    message: 'Email cannot be blank' 
  })
];

var PlayerSchema = new Schema({
    bboName             : {type : String, required : 'BBO name cannot be blank', unique: true, trim : true},
    name                : {type : String, required : 'Name cannot be blank', trim : true},
    nation              : {type : String, required : 'Nation cannot be blank', trim : true},
    email               : {type : Email, required : 'Email cannot be blank', unique: true, trim : true, validate: emailValidator},
    level               : {type : String, default : 'Beginner', trim : true},
    isStarPlayer        : {type : Boolean, default : false},
    isBDPlayer          : {type : Boolean, default : false},
    isEnabled           : {type : Boolean, default : false},
    isBlackListed       : {type : Boolean, default : false},
    isBanned            : {type : Boolean, default : false},
    blackList           : [{
      from                : {type : Date},
      to                  : {type : Date},
      reason              : {type : String, default : '', trim : true} }],
    playedInTournaments : [{type : Schema.Types.ObjectId, ref : 'Tournament'}],
    totalScores         : {
      numTournaments      : {type : Number, default : 0},
      averageScore        : {type : Number, default : 0},
      averageMatchPoints  : {type : Number, default : 0},
      awards              : {type : Number, default : 0}},
    monthlyScores       : [{
      month               : {type : Number},
      year                : {type : Number},
      numTournaments      : {type : Number, default : 0},
      averageScore        : {type : Number, default : 0},
      averageMatchPoints  : {type : Number, default : 0},
      awards              : {type : Number, default : 0}}],
    validatedAt         : {type : Date},
    createdAt           : {type : Date, default: Date.now}
});

/*
 * Helper functions.
 */

function updateScores(scores, result) {
  var numTournaments = scores.numTournaments || 0;
  var sumOfScores = (scores.averageScore || 0) * numTournaments + (result.score || 0);
  var sumOfMatchPoints = (scores.averageMatchPoints || 0) * numTournaments + (result.matchPoints || 0);
  numTournaments += 1;

  scores.numTournaments = numTournaments;
  scores.averageScore = sumOfScores / numTournaments;
  scores.averageMatchPoints = sumOfMatchPoints / numTournaments;
  scores.awards += result.awards || 0;
}

function handleError(msg, cb) {
  if (typeof cb === 'function') {
    cb(new Error(msg), null);
  }
}

/*
 * Methods
 */

PlayerSchema.methods = {

  /**
   * Did player play in specified tournament?
   *
   * @param {Object} tournament
   * @return true if the player played in the tournament, false otherwise.
   */
  playedInTournament: function (tournament) {
    var arr = this.populated('playedInTournaments') || this.playedInTournaments;
    return arr.indexOf(tournament.id) >= 0;
  },


  /**
   * Add tournament result. This will update the total and monthly scores.
   * The resulting scores are NOT saved to the database!
   *
   * @param {Object} tournament 
   */
  addTournament: function (tournament) {
    var score = null;
    var newMonth = true;
    var newMonthlyScore = {
      month: tournament.date.getMonth(),
      year: tournament.date.getFullYear(),
      numTournaments: 0,
      averageScore: 0,
      averageMatchPoints: 0,
      awards: 0
    };

    // Check if scores of this tournament have already been added.
    if (this.playedInTournament(tournament)) {
      throw new Error('Tournament ' + tournament.name + ' scores are already added for player ' + this.bboName);
    }

    // Check if the player actually played in the tournament.
    score = tournament.findPlayerScores(this.bboName);
    if (score ===  null) {
      throw new Error('Player ' + this.bboName + ' did\'t play in tournament ' + tournament.name);
    }

    // Update total scores
    updateScores(this.totalScores, score);

    // Update monthly scores
    this.monthlyScores.every(function (monthlyScore, i) {
      if (monthlyScore.year === tournament.date.getFullYear() &&
          monthlyScore.month === tournament.date.getMonth()) {
        updateScores(monthlyScore, score);
        return newMonth = false;
      }
      return true;
    });

    if (newMonth) {
      // First tournament in this month
      updateScores(newMonthlyScore, score);
      this.monthlyScores.push(newMonthlyScore);
    }

    this.playedInTournaments.push(tournament);
  }
};

module.exports = {
    Player: mongoose.model('Player', PlayerSchema)
};
