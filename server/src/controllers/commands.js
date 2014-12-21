var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var Blacklist = mongoose.model('Blacklist');
var async = require('async');

var flags = {
  enable: { isEnabled : true },
  disable: { isEnabled : false }
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
  var date = moment.utc().toDate();

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
  var date = moment.utc().toDate();

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

commands.blacklist = function (req, res) {
  var cmd = req.body;

  async.map(cmd.rows, function (row, cb) {
    Blacklist.addEntry(row.bboName, cmd.from, cmd.for, cmd.reason, cb);
  }, function (err, blacklisted) {
    if (err) {
      console.log('blacklist', err);
      res.json({error: 'Error setting blacklist'});
    }
    else {
      res.json({ _id: 1, rows: blacklisted, from: cmd.from, for: cmd.for, reason: cmd.reason });
    }
  });
};

module.exports = commands;