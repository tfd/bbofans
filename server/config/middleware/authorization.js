/* jshint -W097 */
"use strict";

/**
 *  Generic require login routing middleware
 */

module.exports = {
  requiresLogin: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    if (req.method === 'GET') {
      req.session.returnTo = req.originalUrl;
    }
    res.redirect(403, '/login');
  },

  isSameUser: function (req, res, next) {
    if (req.params.id !== req.user.userId) {
      req.flash('info', 'You are not authorized');
      return res.redirect(403, '/admin/home');
    }
    next();
  },

  member: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isMemberManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect(403, '/admin/home');
      }
      next();
    }
  },

  td: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isTd) {
        req.flash('info', 'You are not authorized');
        return res.redirect(403, '/admin/home');
      }
      next();
    }
  },

  tdManager: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isTdManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect(403, '/admin/home');
      }
      next();
    }
  },

  blacklist: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isBlacklistManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect(403, '/admin/home');
      }
      next();
    }
  },

  email: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isEmailManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect(403, '/admin/home');
      }
      next();
    }
  },

  setup: {
    hasAuthorization: function (req, res, next) {
      if (! req.user.isSetupManager) {
        req.flash('info', 'You are not authorized');
        return res.redirect(403, '/admin/home');
      }
      next();
    }
  }

};
