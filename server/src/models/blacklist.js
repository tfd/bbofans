
/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;
var mongooseTypes = require("nifty-mongoose-types");
mongooseTypes.loadTypes(mongoose);

/*
 * Member Schema
 */

var BlacklistSchema = new Schema({
    bboName             : {type : String, required : 'BBO name cannot be blank', unique: true, trim : true},
    blackList           : [{
      from                : {type : Date},
      to                  : {type : Date},
      reason              : {type : String, default : '', trim : true} }],
    createdAt           : {type : Date, default: Date.now}
});

/*
 * Helper functions.
 */

function handleError(msg, cb) {
  if (typeof cb === 'function') {
    cb(new Error(msg), null);
  }
}

/*
 * Methods
 */

BlacklistSchema.methods = {
  isMember: function (cb) {
    var Member = mongoose.model('Member');
    Member.findOne({ bboName : this.bboName }, function (err, member) {
      if (cb) cb(err || (member === null) ? false : true);
    });
  }
};

module.exports = mongoose.model('Blacklist', BlacklistSchema);
