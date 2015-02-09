/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var moment = require('moment');
var _ = require('underscore');
var async = require('async');

module.exports = function (config) {

  function getMembersHtml(type, members, cb) {
    config.servers.setup.getEmailText(type, function (err, setup) {
      if (setup) {
        setup.text = setup.text
            .replace('{{bboNames}}', members.join(', '))
            .replace('{{count}}', members.length);
      }

      cb(err, setup);
    });
  }

  function getHtml(type, member, cb) {
    config.servers.setup.getEmailText(type, function (err, setup) {
      if (setup) {
        setup.text = setup.text
            .replace('{{name}}', member.name || member.bboName);
      }

      cb(err, setup);
    });
  }

  function sendToTds(setup) {
    Member.find().where('role').ne('member').exec(function (err, tds) {
      if (err) {
        return console.error('sendToTds', err);
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
        subject: '[BBO Fans] ' + setup.title,
        html   : setup.text
      };
      config.servers.sendMail(email);
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
            numTournaments: {$gte: 4},
            averageScore  : {$gt: 50}
          })
          .exec(function (err, promotedMembers) {
            if (err) {
              console.error('promotion.promote', err);
              return res.status(500).json({error: err});
            }

            var members = [];
            async.each(promotedMembers, function (member, cb) {
                  members.push(member.bboName);

                  getHtml('promote', function (err, setup) {
                    if (err) {
                      cb(err);
                    }

                    if (!setup) {
                      cb({setup: 'No "promote" email text found'});
                    }

                    config.servers.sendMail({
                      to     : member.emails[0],
                      bcc    : '',
                      subject: '[BBO Fans] ' + setup.title,
                      html   : setup.text
                    });
                  });

                },
                function (err) {
                  if (err) {
                    console.error('promotion.promote', err);
                    return res.status(500).json({error: err});
                  }

                  getMembersHtml('promotedMembers', members, function (err, setup) {
                    if (err) {
                      console.error('promotion.promote', err);
                      return res.status(500).json({error: err});
                    }

                    if (!setup) {
                      return res.status(404).json({error: {setup: 'No "promotedMember" email text found'}});
                    }

                    sendToTds(setup);
                  });
                });
          });
    },

    demote: function (req, res) {
      var previousMonth = moment().utc().subtract(1, 'M');
      var month = previousMonth.month();
      var year = previousMonth.year();
      var threeMonthsAgo = moment().utc().subtract(3, 'M');

      Member.find()
          .where('isEnabled').equals(true)
          .where('isRbdPlayer').equals(true)
          .where('isBlackListed').equals(false)
          .where('isBanned').equals(false)
          .or([{'rbd.lastPlayedAt': {$lte: threeMonthsAgo.toISOString()}},
               {
                 'rbd.monthlyScores': {
                   $elemMatch: {
                     month         : month,
                     year          : year,
                     numTournaments: {$gte: 4},
                     awards        : {$lt: 10}
                   }
                 }
               }])
          .exec(function (err, demotedMembers) {
            if (err) {
              console.error('promotion.demote', err);
              return res.status(500).json({error: err});
            }

            var members = [];
            async.each(demotedMembers, function (member, cb) {
                  members.push(member.bboName);

                  getHtml('demote', function (err, setup) {
                    if (err) {
                      cb(err);
                    }

                    if (!setup) {
                      cb({setup: 'No "demote" email text found'});
                    }

                    config.servers.sendMail({
                      to     : member.emails[0],
                      bcc    : '',
                      subject: '[BBO Fans] ' + setup.title,
                      html   : setup.text
                    });
                  });

                },
                function (err) {
                  if (err) {
                    console.error('promotion.demote', err);
                    return res.status(500).json({error: err});
                  }

                  getMembersHtml('demotedMembers', members, function (err, setup) {
                    if (err) {
                      console.error('promotion.demote', err);
                      return res.status(500).json({error: err});
                    }

                    if (!setup) {
                      return res.status(404).json({error: {setup: 'No "demotedMember" email text found'}});
                    }

                    sendToTds(setup);
                  });
                });
          });
    }
  };
};
