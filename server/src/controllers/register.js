/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var moment = require('moment');
var Handlebars = require('handlebars');

module.exports = function (config) {

  function getHtml(member, cb) {
    var url = config.mail.confirmationUrl.replace(':id', member._id);
    config.server.setup.getEmailText('register', {
      member  : member,
      url     : url,
      linkName: url
    }, cb);
  }

  return {
    register: function (req, res) {
      var member = req.body;
      config.servers.reCaptcha.checkDirect(req, member['g-recaptcha-response'], function (data) {
        if (data.success === false) {
          console.error('members.register', data['error-codes']);
          return res.status(422).json({reCaptcha: 'bad captcha'});
        }

        if (!member.password) {
          return res.status(422).json({password: 'cannot be blank'});
        }
        if (member.repeatPassword !== member.password) {
          return res.status(422).json({repeatPassword: "doesn't match"});
        }
        delete member.repeatPassword;
        delete member['g-recaptcha-response'];

        if (!member.emails || member.emails.length === 0 || !member.emails[0]) {
          return res.status(422).json({emails: 'cannot be blank'});
        }

        var newMember = new Member(member);
        newMember.save(function (err, member) {
          if (err) {
            var error = err.err.toString();
            if (error.indexOf('E11000 duplicate key error') === 0) {
              var fieldName = error.match(/members\.\$(.*)_\d/i)[1];
              var fieldValue = error.match(/dup\skey:\s\{\s:\s"(.*)"\s\}/)[1];
              var errors = {};
              errors[fieldName] = 'Value "' + fieldValue + '" already present in database';
              res.status(409).json(errors);
            }
            else {
              console.error('members.register', err);
              res.status(422).json({bboName: error});
            }
          }
          else {
            var url = config.mail.confirmationUrl.replace(':id', member._id);
            config.server.setup.getEmailText('register', {
              member  : member,
              url     : url,
              linkName: url
            }, function (err, setup) {
              if (err || setup) {
                return res.status(500).json({error: err});
              }

              config.servers.sendMail({
                to     : member.emails[0],
                subject: '[BBO Fans] ' + setup.title,
                html   : setup.text
              });
              res.json(member);
            });
          }
        });
      });
    },

    getRegistrant: function (req, res) {
      Member.findById(req.params.id, function (err, registrant) {
        if (err) {
          console.error('members.getById', err);
          return res.status(500).json({error: err});
        }

        if (registrant === null) {
          res.status(404).json({error: 'Member not found.'});
        }
        else {
          res.json({_id: registrant._id, bboName: registrant.bboName});
        }
      });
    },

    confirmEmail: function (req, res) {
      var date = moment.utc().toDate();
      Member.findByIdAndUpdate(req.params.id, {$set: {registeredAt: date}}, {new: false}, function (err, member) {
        if (err) {
          console.error('members.confirmEmail', err);
          return res.status(500).redirect('/#serverError');
        }

        if (member === null) {
          return res.status(404).redirect('/#pageNotFound');
        }

        res.redirect('/#register/confirmed');
      });
    }

  };
};