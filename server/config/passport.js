var passport = require('passport');
var localStrategy = require('./passport.strategies/local');
var User = require('../src/models/user');

/**
 * Initialize passport.
 */
module.exports = function (passport, config) {
  // serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  })

  passport.deserializeUser(function (id, done) {
    User.findOne( { _id: id }, function (err, user) {
      done(err, user)
    })
  })

  // use these strategies
  passport.use(localStrategy);
};
