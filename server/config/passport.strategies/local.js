var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var Role = mongoose.model('Role');
var async = require('async');

module.exports = new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function (username, password, done) {
      Member.findOne({bboName: username}, function (err, member) {
        if (!member) {
          done(null, false, {message: 'Invalid user'});
        }
        else if (!member.authenticate(password)) {
          done(null, false, {message: 'Invalid password'});
        }
        else {
          member.getRole(done);
        }
      });
    });

