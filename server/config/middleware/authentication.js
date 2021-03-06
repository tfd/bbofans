/* jshint -W097 */
"use strict";

module.exports = function (app, config, passport) {
  // Copied from https://gist.github.com/cultofmetatron/5349630
  return function (req, res) {
    passport.authenticate('local', function (err, user) {
      if (req.xhr) {
        //thanks @jkevinburton
        if (err) {return res.json({error: err.message}); }
        if (!user) { return res.json({error: "Invalid Login"}); }
        req.login(user, function (err) {
          if (err) { return res.json({error: err}); }
          return res.json(
              {
                user   : {
                  _id               : req.user._id,
                  username          : req.user.bboName,
                  isMemberManager   : req.user.isMemberManager,
                  isBlacklistManager: req.user.isBlacklistManager,
                  isTdManager       : req.user.isTdManager,
                  isTd              : req.user.isTd
                },
                success: true
              });
        });
      }
      else {
        if (err) { return res.redirect(403, '/login'); }
        if (!user) { return res.redirect(403, '/login'); }
        req.login(user, function (err) {
          if (err) {
            return res.redirect(403, '/login');
          }
          return res.redirect(303, '/admin/home');
        });
      }
    })(req, res);
  };
};

