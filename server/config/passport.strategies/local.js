var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    var options = {
      criteria: { username: username },
      select: 'username hashed_password salt'
    };
    User.findOne( { username: username }, function (err, user) {
      if (err) return done(err)

      if (!user) {
        return done(null, false, { message: 'Invalid user or password' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Invalid user or password' });
      }

      return done(null, user);
    });
  }
);
