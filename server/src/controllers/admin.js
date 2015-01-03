/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Role = mongoose.model('Role');
var Member = mongoose.model('Member');
var Generator = require('../utils/generatePassword');
var async = require('async');

Role.find().count(function (err, count) {
  if (err) {
    console.log(err);
    return;
  }
  if (count === 0) {
    async.parallel([
          function (cb) {
            new Role({
              name              : 'admin',
              isTd              : true,
              isTdManager       : true,
              isBlacklistManager: true,
              isMemberManager   : true
            }).save(cb);
          },
          function (cb) {
            new Role({
              name              : 'member manager',
              isTd              : false,
              isTdManager       : false,
              isBlacklistManager: false,
              isMemberManager   : false
            }).save(cb);
          },
          function (cb) {
            new Role({
              name              : 'blacklist manager',
              isTd              : true,
              isTdManager       : false,
              isBlacklistManager: true,
              isMemberManager   : false
            }).save(cb);
          },
          function (cb) {
            new Role({
              name              : 'td manager',
              isTd              : true,
              isTdManager       : false,
              isBlacklistManager: false,
              isMemberManager   : false
            }).save(cb);
          },
          function (cb) {
            new Role({
              name              : 'td',
              isTd              : true,
              isTdManager       : false,
              isBlacklistManager: false,
              isMemberManager   : false
            }).save(cb);
          },
          function (cb) {
            new Role({
              name              : 'member',
              isTd              : false,
              isTdManager       : false,
              isBlacklistManager: false,
              isMemberManager   : false
            }).save(cb);
          }
        ],
        function () {
          console.log('Roles created');
        });
  }
});

Member.findOne({bboName: 'pensando'}).exec(function (err, admin) {
  if (err) {
    console.log('Find pensando', err);
    return;
  }
  if (admin && admin.hashed_password) { return; }

  var password = new Generator().exactly(3).uppercase
      .exactly(2).numbers
      .length(8).lowercase
      .shuffle.get();

  if (admin === null) {
    // At least admin should be there.
    admin = new Member({
      bboName      : 'pensando',
      role         : 'admin',
      password     : password,
      email        : 'rita@bbofans.com',
      name         : 'Rita de Beus',
      nation       : 'Netherlands',
      level        : 'Expert',
      isStarPlayer : false,
      isBlackListed: false,
      isEnabled    : true,
      isRbdPlayer  : true,
      isBanned     : false
    });
  }
  else if (!admin.hashed_password) {
    admin.password = password;
  }

  console.log('Create admin', admin);
  admin.save(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Admin password ' + password);
    }
  });
});

module.exports = {

  session: function (req, res) {
    var redirectTo = req.session.returnTo || '/admin/home';
    delete req.session.returnTo;
    res.redirect(redirectTo);
  },

  logout: function (req, res) {
    req.logout();
    res.redirect('/admin/login');
  },

  getUser: function (req, res) {
    if (req.isAuthenticated()) {
      res.json(req.user);
    }
    else {
      res.json({error: 'not authenticated'});
    }
  }

};
