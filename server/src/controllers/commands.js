var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var async = require('async');

var flags = {
  enable: { isEnabled : true },
  disable: { isEnabled : false },
  blacklist: { isBlackListed : true },
  whitelist: { isBlackListed : false },
  ban: { isBanned : true },
  unban: { isBanned : false }
};

function sendMail(to, bcc, subject, message, cb) {
  console.log('sendMail', to, bcc, subject, message);
  cb(null, {});
}

var commands = {};

function commandFactory (func) {
  var setter = flags[func];

  commands[func] = function (req, res) {
    var errors = [];
    var cmd = req.body;
    async.map(cmd.rows, function (row, cb) {
      Member.findByIdAndUpdate(row._id, { $set : setter }, { new : false }).exec(cb);
    }, function (err, results) {
      if (err) {
        console.log(func, err);
        res.json({error: 'Error executing ' + func});
      }
      else {
        res.json({ _id: 1, rows: results });
      }
    });
  };
}

for (var func in flags) {
  commandFactory(func);
}

commands.validate = function (req, res) {
  var cmd = req.body;
  var date = new Date();
  async.map(cmd.rows, function (row, cb) {
    Member.findByIdAndUpdate(row._id, { $set : { validatedAt : date } }, { new : false }).exec(cb);
  }, function (err, results) {
    if (err) {
      console.log('validate', err);
      res.json({error: 'Error setting "validatedAt" = ' + date});
    }
    else {
      res.json({ _id: 1, rows: results });
    }
  });
};

commands.email = function (req, res) {
  var cmd = req.body;
  var date = new Date();
  var emails = 
  async.map(cmd.rows, function (row, cb) {
    cb(null, row.email);
  }, function (err, emails) {
    sendMail ("info@bbofans.com", emails, cmd.subject, cmd.message, function (err, result) {
      if (err) {
        console.log('email', err);
        res.json({error: 'Error sending email'});
      }
      else {
        res.json({ _id: 1, rows: results, subject: cmd.subject, message: cmd.message });
      }
    });
  });
};

module.exports = commands;
