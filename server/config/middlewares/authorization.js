/**
 *  Generic require login routing middleware
 */

module.exports = {
  requiresLogin: function (req, res, next) {
    if (req.isAuthenticated()) return next()
    if (req.method == 'GET') req.session.returnTo = req.originalUrl
    res.redirect('/login')
  },

  member: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isMemberManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect('/login');
      }
      next();
    }
  },

  td: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isTdManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect('/login');
      }
      next();
    }
  },

  blacklist: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isBlacklistManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect('/login');
      }
      next();
    }
  },

  user: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isUserManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect('/login');
      }
      next();
    }
  }
  
};
