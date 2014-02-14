
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')[env];
var Schema = mongoose.Schema;

/**
 * Article Schema
 */

var PlayerSchema = new Schema({
    bboName       : {type: String, default : '', trim : true},
    name          : {type : String, default : '', trim : true},
    nation        : {type : String, default : 'Italy', trim : true},
    email         : {type : String, default : '', trim : true},
    level         : {type : String, default : 'Beginner', trim : true},
    isStarPlayer  : {type : Boolean, default : false},
    isBDPlayer    : {type : Boolean, default : false},
    isEnabled     : {type : Boolean, default : false},
    isBlackListed : {type : Boolean, default : false},
    blackList     : [{
      from          : {type : Date},
      to            : {type : Date},
      reason        : {type : String, default : '', trim : true} }],
    tournaments   : [{
      id            : {type : String, default : '', trim : true},
      date          : {type : Date},
      numPlayers    : {type : Number, default : 0 },
      score         : {type : Number, default : 0 },
      matchPoints   : {type : Number, default : 0 },
      awards        : {type : Number, default : 0 }}],
    monthlyScores   : [{
      month         : {type : Number},
      year          : {type : Number},
      numTournaments: {type : Number, default : 0 },
      score         : {type : Number, default : 0 },
      matchPoints   : {type : Number, default : 0 },
      awards        : {type : Number, default : 0 } }],
    createdAt    : {type : Date, default : Date.now },
    validatedAt  : {type : Date },
    updatedAt    : {type : Date }
});

/**
 * Validations
 */

PlayerSchema.path('bboName').required(true, 'BBO name cannot be blank');
PlayerSchema.path('name').required(true, 'Name cannot be blank');
PlayerSchema.path('nation').required(true, 'Nation cannot be blank');
PlayerSchema.path('email').required(true, 'Email cannot be blank');
PlayerSchema.path('name').required(true, 'Level cannot be blank');

/**
 * Methods
 */

PlayerSchema.methods = {

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @param {Function} cb
   * @api private
   */

  addTournament: function (tournamentResult, cb) {
    this.tournaments.push(tournamentResult);

    // TODO: update monthly scores

    this.save(cb)
  }
};

mongoose.model('Player', PlayerSchema);
