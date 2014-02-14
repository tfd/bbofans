var mongoose = require( 'mongoose' );
var db = mongoose.connection;

var playerSchema = mongoose.Schema({
    bboName       : String,
    name          : String,
    nation        : String,
    email         : String,
    level         : String,
    isStarPlayer  : Boolean,
    isBlackListed : Boolean,
    blackList     : [{ from: Date, to: Date, reason: String }],
    tournaments   : [{ id: String, date: Date, numPlayers: Number, score: Number, matchPoints: Number, awards: Number}],
    counters      : [{ month: Number, year: Number, numTournaments: Number, score: Number, matchPoints: Number, awards: Number }],
    created_at    : Date,
    validated_at  : Date,
    updated_at    : Date
});
var players = mongoose.model( 'Players', playerSchema );	

mongoose.connect( 'mongodb://localhost/bbofans' );
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function dbReady() {
    console.log("Database connected");
});
