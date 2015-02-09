/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Account = mongoose.model('Member');
var Generator = require('password-generator');
var moment = require('moment');
var _ = require('underscore');

module.exports = function (config) {

  function getRegisterHtml(member, cb) {
    var url = config.mail.confirmationUrl.replace(':id', member._id);
    config.server.setup.getEmailText('register', function (err, setup) {
      if (setup) {
        setup.text = setup.text
            .replace('name', member.name || member.bboName)
            .replace('url', url)
            .replace('linkName', url);
      }

      cb(err, setup);
    });
  }

  function getResetPasswordText(member, password, cb) {
    var url = config.mail.resetPasswordUrl.replace(':id', member._id).replace(':password', password);
    config.server.setup.getEmailText('resetPassword', function (err, setup) {
      if (setup) {
        setup.text = setup.text
            .replace('name', member.name || member.bboName)
            .replace('url', url)
            .replace('linkName', url);
      }

      cb(err, setup);
    });
  }

  function forgotPassword(field, res, email) {
    return function (err, member) {
      if (err) {
        console.error('admin.forgotPassword', err);
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
          console.error('admin.forgotPassword', err);
          return res.status(500).json({error: err});
        }

        getResetPasswordText(member, password, function (err, setup) {
          if (err) {
            console.error('admin.forgotPassword', err);
            return res.status(500).json({error: err});
          }

          if (!setup) {
            return res.status(404).json({setup: 'No email text for "resetPassword" found'});
          }

          config.servers.sendMail({
            to     : email || member.emails[0],
            subject: '[BBO Fans] ' + setup.title,
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
            getRegisterHtml(member, function (err, setup) {
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
      Account.findById(req.params.id, function (err, registrant) {
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
      Account.findByIdAndUpdate(req.params.id, {$set: {registeredAt: date}}, {new: false}, function (err, account) {
        if (err) {
          console.error('members.confirmEmail', err);
          return res.status(500).redirect('/#serverError');
        }

        if (account === null) {
          return res.status(404).redirect('/#pageNotFound');
        }

        res.redirect('/#register/confirmed');
      });
    },

    changePassword: function (req, res) {
      var password = req.body;
      var id = password._id;
      delete password._id;
      Account.findById(id, function (err, account) {
        if (err) {
          console.error('members.changePassword', err);
          return res.status(500).json({error: err});
        }

        if (!account) {
          return res.status(404).json({_id: 'Member not found'});
        }

        if (!account.authenticate(password.currentPassword)) {
          return res.status(422).json({currentPassword: 'Incorrect password'});
        }

        if (password.newPassword !== password.repeatPassword) {
          return res.status(422).json({repeatPassword: "doesn't match"});
        }

        account.password = password.newPassword;
        account.save(function (err) {
          if (err) {
            console.error('members.changePassword', err);
            return res.status(500).json({error: 'Error changing password.'});
          }

          res.json(account);
        });
      });
    },

    forgotPassword: function (req, res) {
      if (req.body.email) {
        Account.findOne({emails: req.body.email}, forgotPassword('email', res, req.body.email));
      }
      else if (req.body.bboName) {
        Account.findOne({bboName: req.body.bboName}, forgotPassword('bboName', res));
      }
      else {
        res.status(422).json({bboName: "can't be blank", email: "can't be blank"});
      }
    },

    resetPassword: function (req, res) {
      var id = req.params.id;
      var password = req.params.password;
      console.log(id, password);
      Account.findById(id, function (err, member) {
        if (err) {
          console.error('members.resetPassword', err);
          return res.status(500).json({error: err});
        }

        if (!member) {
          console.log('no such member');
          return res.status(404).redirect('/#pageNotFound');
        }

        if (!member.authenticate(password)) {
          console.log('bad password');
          return res.status(404).redirect('/#pageNotFound');
        }

        console.log('redirect', '/#password/reset/' + member._id + '/' + password);
        return res.status(302).redirect('/#password/reset/' + member._id + '/' + password);
      });
    }

  };
};
