/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var Blacklist = mongoose.model('Blacklist');
var async = require('async');
var moment = require('moment');

module.exports = function (config) {

  /**
   * Replace placeholders in the input string.
   *
   * @param {String} str - the string with the placeholders
   * @param {Object} member - current member to copy the date from
   * @returns {string} the string with all placeholders replaced with the values from member.
   */
  function replacePlaceHolders(str, member) {
    return str.replace(/\{bboName\}/gi, member.bboName)
        .replace(/\{name\}/gi, member.name)
        .replace(/\{email\}/gi, member.email)
        .replace(/\{level\}/gi, member.level)
        .replace(/\{telephone\}/gi, member.telephone)
        .replace(/\{country\}/gi, member.nation);
  }

  var flags = {
    enable : {isEnabled: true},
    disable: {isEnabled: false}
  };

  var commands = {};

  function commandFactory(func) {
    var setter = flags[func];

    commands[func] = function (req, res) {
      var cmd = req.body;

      async.map(cmd.rows, function (row, cb) {
        Member.findByIdAndUpdate(row._id, {$set: setter}, {new: false}).exec(cb);
      }, function (err, results) {
        if (err) {
          console.error("commandsFactory", func, err);
          return res.status(500).json({error: err});
        }

        res.json({_id: 1, rows: results});
      });
    };
  }

  var func;
  for (func in flags) {
    if (flags.hasOwnProperty(func)) {
      commandFactory(func);
    }
  }

  commands.validate = function (req, res) {
    var cmd = req.body;
    var date = moment.utc().toDate();

    async.map(cmd.rows, function (row, cb) {
      Member.findByIdAndUpdate(row._id, {$set: {validatedAt: date}}, {new: false}).exec(cb);
    }, function (err, results) {
      if (err) {
        console.error('commands.validate', err);
        return res.status(500).json({error: err});
      }

      res.json({_id: 1, rows: results});
    });
  };

  commands.email = function (req, res) {
    var cmd = req.body;

    async.map(cmd.rows, function (member, cb) {
      var to = '"' + member.name + '" <' + member.email + '>';
      var subject = replacePlaceHolders(cmd.subject, member);
      var message = replacePlaceHolders(cmd.message, member);
      config.servers.sendMail({
        to     : to,
        subject: subject,
        text   : message
      }, cb);
    }, function (err, info) {
      if (err) {
        console.error('commands.email', err);
        return res.status(500).json({error: err});
      }

      res.json({_id: 1, rows: cmd.rows, info: info});
    });
  };

  commands.blacklist = function (req, res) {
    var cmd = req.body;

    async.map(cmd.rows, function (row, cb) {
      Blacklist.addEntry(row.bboName, cmd.from, cmd.for, cmd.reason, cb);
    }, function (err, blacklisted) {
      if (err) {
        console.error('commands.blacklist', err);
        return res.status(500).json({error: err});
      }

      res.json({_id: 1, rows: blacklisted, from: cmd.from, for: cmd.for, reason: cmd.reason});
    });
  };

  return commands;
};
