/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var moment = require('moment');

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
            config.servers.sendMail({
              to     : member.email,
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