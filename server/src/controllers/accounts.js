/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Account = mongoose.model('Member');
var Generator = require('password-generator');
var moment = require('moment');
var _ = require('underscore');

module.exports = function (config) {

  function getText(member) {
    var url = config.mail.confirmationUrl.replace(':id', member._id);
    return 'Welcome ' + (member.name || member.bboName) + ',\n\n' +
           'Thank you for your registration to the BBO Fans.\n' +
           'To complete the procedure, please click on the following link.\n' + url + '\n' +
           'If you are unable to click on the link just cut&amp;paste it in the browser bar and press enter.\n\n' +
           'Thanks,\n\nBBO Fans Admin';
  }

  function getHtml(member) {
    var url = config.mail.confirmationUrl.replace(':id', member._id);
    return '<h1>Welcome ' + (member.name || member.bboName) + ',</h1>' +
           '<p>Thank you for your registration to the BBO Fans.<br/>To complete the procedure, please click on the following link.</p>' +
           '<p><a href="' + url + '">' + url + '</a></p>' +
           '<p>If you are unable to click on the link just cut&amp;paste it in the browser bar and press enter.</p>' +
           '<p>Thanks.<br/><br/>BBO Fans Admin</p>';
  }

  function getResetPasswordText(member, password) {
    var url = config.mail.resetPasswordUrl.replace(':id', member._id).replace(':password', password);
    return 'Hello ' + (member.name || member.bboName) + ',\n\n' +
           'You requested a reset of your password.\n' +
           'To complete the procedure, please click on the following link.\n' + url + '\n' +
           'If you are unable to click on the link just cut&amp;paste it in the browser bar and press enter.\n' +
           'Even if you didn\'t request the change your password has been reset anyway, so you MUST click on the link!\n' +
           'Thanks,\n\nBBO Fans Admin';
  }

  function getResetPasswordHtml(member, password) {
    var url = config.mail.resetPasswordUrl.replace(':id', member._id).replace(':password', password);
    return '<h1>Hello ' + (member.name || member.bboName) + ',</h1>' +
           '<p>You requested a reset of your password.<br/>To complete the procedure, please click on the following link.</p>' +
           '<p><a href="' + url + '">' + url + '</a></p>' +
           '<p>If you are unable to click on the link just cut&amp;paste it in the browser bar and press enter.</p>' +
           '<p>Even if you didn\'t request the change your password has been reset anyway, so you MUST click on the link!</p>' +
           '<p>Thanks.<br/><br/>BBO Fans Admin</p>';
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
        return res.json(error);
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

        config.servers.sendMail({
          to     : email || member.emails[0],
          subject: '[BBO Fans] Reset Password',
          text   : getResetPasswordText(member, password),
          html   : getResetPasswordHtml(member, password)
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

        var newMember = new Account(member);
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
            config.servers.sendMail({
              to     : member.emails[0],
              subject: '[BBO Fans] Registration Confirmation',
              text   : getText(member),
              html   : getHtml(member)
            });
            res.json(member);
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
        res.json({bboName: "can't be blank", email: "can't be blank"});
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
