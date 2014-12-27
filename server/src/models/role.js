/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * User Schema
 */

var RoleSchema = new Schema({
  name              : {type: String, required: 'Name cannot be blank', unique: true, trim: true},
  isTd              : {type: Boolean, default: false},
  isMemberManager   : {type: Boolean, default: false},
  isBlacklistManager: {type: Boolean, default: false},
  isTdManager       : {type: Boolean, default: false},
  createdAt         : {type: Date, default: Date.now}
});

module.exports = mongoose.model('Role', RoleSchema);
