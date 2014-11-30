
/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

/*
 * User Schema
 */

var UserSchema = new Schema({
    username           : {type : String, required : 'Username cannot be blank', unique: true, trim : true},
    hashed_password    : {type : String, required : 'Password cannot be blank', trim : true},
    salt               : {type : String},
    isMemberManager    : {type : Boolean, default : false},
    isBlacklistManager : {type : Boolean, default : false},
    isTdManager        : {type : Boolean, default : false},
    createdAt          : {type : Date, default: Date.now}
});

/*
 * Helper functions
 */

/**
 * Make salt
 *
 * @return {String}
 * @api public
 */
function makeSalt () {
  return Math.round((new Date().valueOf() * Math.random())) + '';
}

/**
 * Encrypt password
 *
 * @param {String} password
 * @return {String}
 * @api public
 */
function encryptPassword (password, salt) {
  if (!password) return '';
  
  try {
    return crypto.createHmac('sha1', salt)
                 .update(password)
                 .digest('hex');
  } catch (err) {
    return '';
  }
}

/*
 * Virtuals
 */

UserSchema.virtual('password')
          .set(function(password) {
            this._password = password;
            this.salt = makeSalt();
            this.hashed_password = encryptPassword(password, salt);
          })
          .get(function() { return this._password; });

/*
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText password to check
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText, this.salt) === this.hashed_password;
  },

};

module.exports = mongoose.model('User', UserSchema);
