/* jshint -W097 */
"use strict";

/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;
var mongooseTypes = require("nifty-mongoose-types");
mongooseTypes.loadTypes(mongoose);
var moment = require('moment');
require('moment-range');
var async = require('async');

/*
 * Blacklist Schema
 */

var EntrySchema = new Schema({
  td    : {type: String, default: '', required: 'td cannot be blank', trim: true},
  from  : {type: Date},
  to    : {type: Date},
  reason: {type: String, default: '', required: 'reason cannot be blank', trim: true}
}, {
  _id: false
});

var BlacklistSchema = new Schema({
  bboName  : {type: String, required: 'BBO name cannot be blank', unique: true, trim: true},
  entries  : [EntrySchema],
  createdAt: {type: Date, default: Date.now}
});

/*
 * Helper functions.
 */

function handleError(msg, cb) {
  if (typeof cb === 'function') {
    cb(new Error(msg), null);
  }
}

BlacklistSchema.pre('save', function (next) {
  this.bboName = this.bboName.toLowerCase();
  next();
});

/*
 * Methods
 */

BlacklistSchema.methods = {
  isMember: function (cb) {
    var Member = mongoose.model('Member');
    Member.findOne({bboName: this.bboName}, function (err, member) {
      if (cb) {
        cb(err || (member === null) ? false : true);
      }
    });
  }
};

BlacklistSchema.statics = {
  addEntry: function (bboName, td, date, period, reason, callback) {
    var Blacklist = this;
    var Member = mongoose.model('Member');
    var blacklist = null;

    async.waterfall(
        [
          function (cb) {
            Blacklist.findOne({bboName: bboName}, cb);
          },
          function (bl, cb) {
            blacklist = bl;
            Member.findOne({bboName: td}, cb);
          },
          function (member, cb) {
            if (member === null) {
              return cb({validationError: {'td': '"' + td + '" is not a member of BBO fans'}});
            }

            var fromDate = moment.utc(date);
            if (!fromDate.isValid()) {
              return cb({validationError: {'from': 'Value "' + date + '" is an invalid date'}}, blacklist);
            }
            var num = parseInt(period, 10);
            var type = period.slice(-1);
            var toDate = type === 'F' ? moment.utc('2050-12-31') : fromDate.clone().add(num, type);
            if (!toDate.isValid()) {
              return cb({validationError: {'for': 'Value "' + period + '" is an invalid duration'}});
            }

            if (blacklist === null) {
              blacklist = new Blacklist({bboName: bboName});
            }

            if (!blacklist.entries) {
              blacklist.entries = [];
            }
            blacklist.entries.push({
              td    : td,
              'from': fromDate.toDate(),
              'to'  : toDate.toDate(),
              reason: reason
            });

            blacklist.save(function (err, savedBlacklist) {
              blacklist = savedBlacklist;

              if (err) {
                var error = err.err.toString();
                if (error.indexOf('E11000 duplicate key error') === 0) {
                  var fieldName = error.match(/blacklists\.\$(.*)_\d/i)[1];
                  var fieldValue = error.match(/dup\skey:\s\{\s:\s\"(.*)\"\s\}/)[1];
                  var errors = {};
                  errors[fieldName] = 'Value "' + fieldValue + '" already present in database';
                  return cb({validationError: errors});
                }

                return cb({validationError: {bboName: error}});
              }

              // Update isBanned and isBlacklisted flags.
              var isBanned = (type === 'F');
              var isBlackListed = isBanned || moment().range(fromDate, toDate).contains(moment.utc());
              Member.update({bboName: bboName},
                  {$set: {isBanned: isBanned, isBlackListed: isBlackListed}},
                  cb);
            });
          }
        ],
        function (err) {
          callback(err, blacklist);
        });
  }
};

module.exports = mongoose.model('Blacklist', BlacklistSchema);
