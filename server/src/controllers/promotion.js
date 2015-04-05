/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var moment = require('moment');
var _ = require('underscore');
var async = require('async');
var logger = require('../utils/logger');

module.exports = function (config) {

  function getMembersHtml(type, members, cb) {
    config.servers.setup.getEmailText(type, {members: members}, cb);
  }

  function getHtml(type, member, cb) {
    config.servers.setup.getEmailText(type, {member: member}, cb);
  }

  function sendToAdmins(setup) {
    Member.find()
        .where('role').equals('admin')
        .exec(function (err, tds) {
          if (err) {
            return logger.error('sendToTds', err);
          }

          var bcc = [];
          if (tds) {
            _.each(tds, function (td) {
              if (td.emails && td.emails[0]) {
                bcc.push(td.emails[0]);
              }
            });
          }
          bcc.push('ronald.vanuffelen@gmail.com');

          var email = {
            to     : config.mail.replyTo,
            bcc    : bcc,
            subject: setup.title,
            html   : setup.text
          };
          console.log(email);
          // config.servers.sendMail(email);
        });
  }

  return {

    promote: function (req, res) {
      var previousMonth = moment().utc().subtract(1, 'M');
      var month = previousMonth.month();
      var year = previousMonth.year();

      Member.find()
          .where('isEnabled').equals(true)
          .where('isRbdPlayer').equals(false)
          .where('isBlackListed').equals(false)
          .where('isBanned').equals(false)
          .where('rock.monthlyScores').elemMatch({
            month         : month,
            year          : year,
            numTournaments: {$gte: 10},
            averageScore  : {$gt: 50}
          })
          .exec(function (err, promotedMembers) {
            if (err) {
              logger.error('promotion.promote', err);
              return res.status(500).json({error: err});
            }

            var members = [];
            async.each(promotedMembers,
                function (member, cb) {
                  members.push(member.bboName);

                  config.servers.setup.getEmailText('promote', {member: member}, function (err, setup) {
                    if (err) {
                      cb(err);
                    }

                    if (!setup) {
                      cb({setup: 'No "promote" email text found'});
                    }

                    var email = {
                      to     : member.emails[0],
                      bcc    : '',
                      subject: setup.title,
                      html   : setup.text
                    };
                    console.log(email);
                    /*
                     config.servers.sendMail(email);
                     */
                  });
                },
                function (err) {
                  if (err) {
                    logger.error('promotion.promote', err);
                    return res.status(500).json({error: err});
                  }

                  config.servers.setup.getEmailText('promotedMembers', {members: members}, function (err, setup) {
                    if (err) {
                      logger.error('promotion.promote', err);
                      return res.status(500).json({error: err});
                    }

                    if (!setup) {
                      return res.status(404).json({error: {setup: 'No "promotedMember" email text found'}});
                    }

                    sendToAdmins(setup);

                    return res.json({promoted: members.length});
                  });
                });
          });
    },

    demote: function (req, res) {
      return res.json({demoted: 0});

      /*
       var previousMonth = moment().utc().subtract(1, 'M');
       var month = previousMonth.month();
       var year = previousMonth.year();
       var threeMonthsAgo = moment().utc().subtract(3, 'M');

       Member.find()
       .where('isEnabled').equals(true)
       .where('isRbdPlayer').equals(true)
       .where('isBlackListed').equals(false)
       .where('isBanned').equals(false)
       .where('rbd.lastPlayedAt').lte(threeMonthsAgo.toISOString())
       .set('isRbdPlayer', false)
       .exec(function (err, inactivePlayers) {
       if (err) {
       logger.error('promotion.demote', err);
       return res.status(500).json({error: err});
       }

       // inactivePlayers now holds all RBD players that didn't play the last 3 months.
       var members = [];
       async.each(inactivePlayers, function (member, cb) {
       members.push(member.bboName);

       config.servers.setup.getEmailText('demote', {member: member}, function (err, setup) {
       if (err) {
       cb(err);
       }

       if (!setup) {
       cb({setup: 'No "demote" email text found'});
       }

       config.servers.sendMail({
       to     : member.emails[0],
       bcc    : '',
       subject: setup.title,
       html   : setup.text
       });
       });

       });
       members.length;

       Member.find()
       .where('isEnabled').equals(true)
       .where('isRbdPlayer').equals(true)
       .where('isBlackListed').equals(false)
       .where('isBanned').equals(false)
       .where('rbd.monthlyScores').elemMatch({
       month         : month,
       year          : year,
       numTournaments: {$gte: 1}
       })
       .sort('rbd.monthlyScores.averageScore')
       });

       .or([{'rbd.lastPlayedAt': {$lte: threeMonthsAgo.toISOString()}},
       {
       'rbd.monthlyScores': {
       $elemMatch: {
       month         : month,
       year          : year,
       numTournaments: {$gte: 1},
       awards        : {$lt: 10}
       }
       }
       }])
       .exec(function (err, demotedMembers) {
       if (err) {
       logger.error('promotion.demote', err);
       return res.status(500).json({error: err});
       }

       });
       */
    }
  };
};
