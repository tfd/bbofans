/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Setup = mongoose.model('Setup');
var moment = require('moment');
var _ = require('underscore');
var logger = require('../utils/logger');

Setup.findOne({}, function (err, setup) {
  if (err || !setup) {
    // No setup yet, create a default one.
    new Setup({
      emailTexts: [
        {
          type : 'register',
          title: 'Registration Confirmation',
          text : '<h1>Welcome {{member.name}} ({{member.bboName}}),</h1>' +
               '<p>Thank you for your registration to the BBO Fans.<br/>To complete the procedure, please click on the following link.</p>' +
               '<p><a href="{{url}}">{{link}}</a></p>' +
               '<p>If you are unable to click on the link just cut&amp;paste it in the browser bar and press enter.</p>' +
               '<p>Thanks.<br/><br/>BBO Fans Admin</p>'

        },
        {
          type : 'resetPassword',
          title: 'Reset Password',
          text : '<h1>Hello {{member.name}} ({{member.bboName}}),</h1>' +
               '<p>You requested a reset of your password.<br/>To complete the procedure, please click on the following link.</p>' +
               '<p><a href="{{url}}">{{link}}</a></p>' +
               '<p>If you are unable to click on the link just cut&amp;paste it in the browser bar and press enter.</p>' +
               '<p>Even if you didn\'t request the change your password has been reset anyway, so you MUST click on the link!</p>' +
               '<p>Thanks.<br/><br/>BBO Fans Admin</p>'
        },
        {
          type : 'promote',
          title: 'Promotion to Rock Best Dancers',
          text : '<h1>Congratulations {{member.name}} ({{member.bboName}}),</h1>' +
               '<p>Thanks to you outstanding performance in the last month, you have been promoted to the RBD league!</p>' +
               '<p>Regards,<br/><br/>BBO Fans Admin</p>'
        },
        {
          type : 'demote',
          title: 'Demotion to Rock Best Dancers',
          text : '<h1>Dear {{member.name}} ({{member.bboName}}),</h1>' +
               '<p>Sorry, but your performance in the RBD league was far below average this month, so you have been removed from the RBD league.</p>' +
               '<p>Regards,<br/><br/>BBO Fans Admin</p>'
        },
        {
          type : 'promotedMembers',
          title: 'Promotions',
          text : '<h1>Hello Td,</h1>' +
               '<p>The following members have been promoted to RBD:</p>' +
               '<p>{{#each members}}{{name}} ({{bboName}}){{#unless @last}}, {{/unless}}{{/each}}</p>' +
               '<p>Regards,<br/><br/>BBO Fans Admin</p>'
        },
        {
          type : 'demotedMembers',
          title: 'Demotion',
          text : '<h1>Hello Td,</h1>' +
               '<p>The following members have been demoted from RBD:</p>' +
               '<p>{{#each members}}{{name}} ({{bboName}}){{#unless @last}}, {{/unless}}{{/each}}</p>' +
               '<p>Regards,<br/><br/>BBO Fans Admin</p>'
        },
        {
          type : 'blackList',
          title: 'Blacklist',
          text : '<h1>Hello {{#if member.name}}{{member.name}}{{#if member.bboName}} ({{member.bboName}}){{/if}}{{else}}{{member.bboName}}{{/if}},</h1>' +
               '<p>You\'ve been put on the blacklist until {{entry.to}} for the following reason:</p>' +
               '<p>{{entry.reason}}</p>' +
               '<p>Regards,<br/><br/>BBO Fans Admin</p>'
        },
        {
          type : 'whiteList',
          title: 'Whitelist',
          text : '<h1>Dear {{#if member.name}}{{member.name}}{{#if member.bboName}} ({{member.bboName}}){{/if}}{{else}}{{member.bboName}}{{/if}},</h1>' +
               '<p>You\'ve been removed from the blacklist for the following reason:</p>' +
               '<p>{{entry.reason}}</p>' +
               '<p>Regards,<br/><br/>BBO Fans Admin</p>'
        }
      ],
      rules     : {
        promote: {
          numTournaments: 4,
          field         : 'averageScore',
          minValue      : 50.0
        },
        demote : {
          notPlayedForMonths: 3,
          numTournaments    : 4,
          field             : 'awards',
          minValue          : 10
        }
      }
    }).save(function (err) {
          if (err) {
            logger.error('Unable to save default setup', err);
          }
        });
  }
});

module.exports = function () {

  return {

    getEmailText: function (req, res) {
      Setup.findOne({}, function (err, setup) {
        if (err) {
          logger.error('Setup.getMailText', err);
          return res.status(500).json({error: err});
        }

        if (!setup) {
          return res.status(404).json({error: 'No setup found!'});
        }

        var text = null;
        _.each(setup.emailTexts, function (emailText) {
          if (emailText.type === res.params.type) {
            text = emailText;
          }
        });

        if (!text) {
          return res.status(404).json({type: 'No such type ' + res.params.type});
        }

        res.json(text);
      });
    },

    saveEmailText: function (req, res) {
      Setup.findOne({}, function (err, setup) {
        if (err) {
          logger.error('Setup.saveEmailText', err);
          return res.status(500).json({error: err});
        }

        if (!setup) {
          return res.status(404).json({error: 'No setup found!'});
        }

        var found = false;
        _.each(setup.emailTexts, function (emailText) {
          if (emailText.type === res.body.type) {
            emailText.title = res.body.text;
            emailText.text = res.body.text;
            found = true;
          }
        });

        if (!found) {
          return res.status(404).json({type: 'No such type ' + res.body.type});
        }

        setup.save(function (err) {
          if (err) {
            logger.error('Setup.saveEmailText', err);
            return res.status(500).json({error: err});
          }

          res.json(req.body);
        });
      });
    },

    getRules: function (req, res) {
      Setup.findOne({}, function (err, setup) {
        if (err) {
          logger.error('Setup.getRules', err);
          return res.status(500).json({error: err});
        }

        if (!setup) {
          return res.status(404).json({error: 'No setup found!'});
        }

        res.json(setup.rules);
      });
    },

    saveRules: function (req, res) {
      var newRules = req.body;
      Setup.findOne({}, function (err, setup) {
        if (err) {
          logger.error('Setup.saveRules', err);
          return res.status(500).json({error: err});
        }

        if (!setup) {
          return res.status(404).json({error: 'No setup found!'});
        }

        if (newRules.promote) {
          var promote = setup.promote;
          var newPromote = newRules.promote;

          promote.numTournaments = newPromote.numTournaments || promote.numTournaments;
          promote.field = newPromote.field || promote.field;
          promote.minValue = newPromote.minValue || promote.minValue;
        }
        if (newRules.demote) {
          var demote = setup.demote;
          var newDemote = newRules.demote;

          demote.notPlayedForMonths = newDemote.notPlayedForMonths || demote.notPlayedForMonths;
          demote.numTournaments = newDemote.numTournaments || demote.numTournaments;
          demote.field = newDemote.field || demote.field;
          demote.minValue = newDemote.minValue || demote.minValue;
        }

        setup.save(function (err) {
          if (err) {
            logger.error('Setup.saveRules', err);
            return res.status(500).json({error: err});
          }

          res.json(req.body);
        });
      });
    }
  };
};
