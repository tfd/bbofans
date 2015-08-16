/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var Generator = require('password-generator');
var moment = require('moment');
var _ = require('underscore');
var logger = require('../utils/logger');

module.exports = function (config) {

  function getRegisterHtml(member, cb) {
    var url = config.mail.confirmationUrl.replace(':id', member._id);
    config.server.setup.getEmailText('register', {member: member, url: url, link: url}, cb);
  }

  function forgotPassword(field, res, email) {
    return function (err, member) {
      if (err) {
        logger.error('admin.forgotPassword', err);
        return res.status(500).json({error: err});
      }

      if (!member) {
        var error = {};
        error[field] = 'not found';
        return res.status(404).json(error);
      }

      var password = new Generator().exactly(3).uppercase
          .exactly(2).numbers
          .length(8).lowercase
          .shuffle.get();

      member.password = password;
      member.save(function (err) {
        if (err) {
          logger.error('admin.forgotPassword', err);
          return res.status(500).json({error: err});
        }

        var url = config.mail.resetPasswordUrl.replace(':id', member._id).replace(':password', password);
        config.servers.setup.getEmailText('resetPassword', {member: member, url: url, link: url}, function (err, setup) {
          if (err) {
            logger.error('admin.forgotPassword', err);
            return res.status(500).json({error: err});
          }

          if (!setup) {
            return res.status(404).json({setup: 'No email text for "resetPassword" found'});
          }

          config.servers.sendMail({
            to     : email || member.emails[0],
            subject: setup.title,
            html   : setup.text
          });
        });

        return res.json(member);
      });
    };
  }

  return {

    register: function (req, res) {
      var member = req.body;
      config.servers.reCaptcha.checkDirect(req, member['g-recaptcha-response'], function (data) {
        if (data.success === false) {
          logger.error('members.register', data['error-codes']);
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
            var error = err.err ? err.err.toString() : err.toString();
            if (error.indexOf('E11000 duplicate key error') === 0) {
              var fieldName = error.match(/members\.\$(.*)_\d/i)[1];
              var fieldValue = error.match(/dup\skey:\s\{\s:\s"(.*)"\s\}/)[1];
              var errors = {};
              errors[fieldName] = 'Value "' + fieldValue + '" already present in database';
              res.status(409).json(errors);
            }
            else {
              logger.error('members.register', err);
              res.status(422).json({bboName: error});
            }
          }
          else {
            var url = config.mail.confirmationUrl.replace(':id', member._id);
            config.servers.setup.getEmailText('register', {member: member, url: url, link: url}, function (err, setup) {
              if (err || ! setup) {
                return res.status(500).json({error: err});
              }

              config.servers.sendMail({
                to     : member.emails[0],
                subject: setup.title,
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
          logger.error('members.getById', err);
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
          logger.error('members.confirmEmail', err);
          return res.status(500).redirect('/#serverError');
        }

        if (member === null) {
          return res.status(404).redirect('/#pageNotFound');
        }

        res.redirect('/#register/confirmed');
      });
    },

    changePassword: function (req, res) {
      var password = req.body;
      var id = password._id;
      delete password._id;
      Member.findById(id, function (err, member) {
        if (err) {
          logger.error('members.changePassword', err);
          return res.status(500).json({error: err});
        }

        if (!member) {
          return res.status(404).json({_id: 'Member not found'});
        }

        if (!member.authenticate(password.currentPassword)) {
          return res.status(422).json({currentPassword: 'Incorrect password'});
        }

        if (password.newPassword !== password.repeatPassword) {
          return res.status(422).json({repeatPassword: "doesn't match"});
        }

        member.password = password.newPassword;
        member.save(function (err) {
          if (err) {
            logger.error('members.changePassword', err);
            return res.status(500).json({error: 'Error changing password.'});
          }

          res.json(member);
        });
      });
    },

    forgotPassword: function (req, res) {
      if (req.body.email) {
        Member.findOne({emails: req.body.email}, forgotPassword('email', res, req.body.email));
      }
      else if (req.body.bboName) {
        Member.findOne({bboName: req.body.bboName}, forgotPassword('bboName', res));
      }
      else {
        res.status(422).json({bboName: "can't be blank", email: "can't be blank"});
      }
    },

    resetPassword: function (req, res) {
      var id = req.params.id;
      var password = req.params.password;
      logger.log(id, password);
      Member.findById(id, function (err, member) {
        if (err) {
          logger.error('members.resetPassword', err);
          return res.status(500).json({error: err});
        }

        if (!member) {
          logger.log('no such member');
          return res.status(404).redirect('/#pageNotFound');
        }

        if (!member.authenticate(password)) {
          logger.log('bad password');
          return res.status(404).redirect('/#pageNotFound');
        }

        logger.log('redirect', '/#password/reset/' + member._id + '/' + password);
        return res.status(302).redirect('/#password/reset/' + member._id + '/' + password);
      });
    }

  };
};
