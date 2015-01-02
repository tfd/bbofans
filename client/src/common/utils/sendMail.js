/**
 * @module sendMail
 */

var nodeMailer = require('nodemailer');

var getMailPassword = function (callback) {
  var fs = require('fs');
  fs.readFile('./server/config/mail.key', 'utf8', function (err, password) {
    if (err) {
      console.log(err);
    }
    callback(err ? null : password);
  });
};

// create reusable transporter object using SMTP transport
var transporter = null;


// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails
getMailPassword(function (password) {
  transporter = nodeMailer.createTransport({
    host: 'smtps.aruba.it',
    port: 465,
    secure: true,
    auth: {
      user: 'mailer@bbofans.com',
      pass: password
    }
  });
});


module.exports = function (mailOptions, cb) {
  mailOptions.from = 'BBO Fans <mailer@bbofans.com>';
  transporter.sendMail(mailOptions, cb);
};
