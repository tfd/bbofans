/* jshint -W097 */
"use strict";

var localStrategy = require('./passport.strategies/local');
var Member = require('../src/models/member');
var Role = require('../src/models/role');

/**
 * Initialize passport.
 */
module.exports = function (passport) {
  // serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user.userId);
  });

  passport.deserializeUser(function (id, done) {
    Member.findOne({_id: id}, function (err, member) {
      if (err) { return done(err, null); }
      member.getRole(function (err, role) {
        if (err) {
          console.error('Passport.deserializeUser', id, err);
          return done(err, null);
        }

        role.userId = id;
        role.username = member.bboName;
        done(null, role);
      });
    });
  });

  // use these strategies
  passport.use(localStrategy);
};
