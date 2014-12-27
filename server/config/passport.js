var passport = require('passport');
var localStrategy = require('./passport.strategies/local');
var Member = require('../src/models/member');
var Role = require('../src/models/role');

/**
 * Initialize passport.
 */
module.exports = function (passport, config) {
  // serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  })

  passport.deserializeUser(function (id, done) {
    Member.findOne({_id: id}, function (err, member) {
      if (err) { return done(err, null); }
      member.getRole(done);
    });
  })

  // use these strategies
  passport.use(localStrategy);
};
