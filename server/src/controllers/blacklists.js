/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Blacklist = mongoose.model('Blacklist');
var Member = mongoose.model('Member');
var moment = require('moment');
var async = require('async');
var fields = ['bboName'];
var fieldDefinitions = require('../utils/fieldDefinitions')(Blacklist, fields);
var listQueryParameters = require('../utils/listQueryParameters')(fieldDefinitions);
var exportToFile = require('../utils/exportToFile')('blacklist', 'member', fieldDefinitions);
var _ = require('underscore');
var logger = require('../utils/logger');

exportToFile.setCsvHeaderWriter(function (fields, res) {
  res.write('bboName,from,to,reason');
});

exportToFile.setCsvDocWriter(function (doc, res) {
  var lastEntry = doc.entries[doc.entries.length - 1];
  res.write('"' + exportToFile.csvEscape(doc.bboName) + '",');
  res.write(moment(lastEntry.from).utc().format() + ',');
  res.write(moment(lastEntry.to).utc().format() + ',');
  res.write('"' + exportToFile.csvEscape(lastEntry.reason) + '"');
});

exportToFile.setXmlCollectionPreparer(function (blacklist) {
  blacklist.forEach(function (member) {
    var entry = member.entries;
    member.entries = {entry: entry};
  });
  return blacklist;
});

function getFilter(blacklisted) {
  var now = moment.utc();
  if (blacklisted) {
    return {'entries.from': {$lte: now.toDate()}, 'entries.to': {$gte: now.toDate()}};
  }
  return {$or: [{'entries.from': {$gt: now.toDate()}}, {'entries.to': {$lt: now.toDate()}}]};
}

function getAggregate(blacklisted, aggregate) {
  if (!aggregate) {
    aggregate = Blacklist.aggregate();
  }

  return aggregate.project({_id: {_id: '$_id', bboName: '$bboName', entries: '$entries'}, entries: '$entries'})
      .unwind('entries')
      .group({_id: '$_id', entries: {$last: '$entries'}})
      .match(getFilter(blacklisted ? true : false))
      .project({_id: '$_id._id', bboName: '$_id.bboName', entries: '$_id.entries'});
}

function updateMembers(blacklisted, counter) {
  return function (list, done) {
    counter.num = 0;

    async.each(list, function (member, cb) {
      Member.update(
          {bboName: member.bboName, isBlackListed: !blacklisted},
          {$set: {isBanned: false, isBlackListed: blacklisted}},
          function (err, numberAffected) {
            if (err) { return cb(err); }
            counter.num += numberAffected;
            cb();
          });
    }, done);
  };
}

function getBlacklistMembers(blacklisted) {
  return function (numberAffected, done) {
    if (_.isFunction(numberAffected)) {
      done = numberAffected;
    }

    getAggregate(blacklisted)
        .project({bboName: '$bboName', _id: 0})
        .exec(done);
  };
}

module.exports = function (config) {

  function getHtml(member, blacklist, cb) {
    var entry = _.last(blacklist.entries);
    config.servers.setup.getEmailText(member.isBlackListed ? 'blackList' : 'whiteList', {
          member: member,
          entry : {
            td    : entry.td,
            from  : moment.utc(entry.to).format('MMMM Do YYYY'),
            to    : moment.utc(entry.to).format('MMMM Do YYYY'),
            reason: entry.reason
          }
        },
        cb);
  }

  return {

    getList: function (req, res) {
      var limit = listQueryParameters.getLimit(req);
      var skip = listQueryParameters.getSkip(req);
      var sort = listQueryParameters.getSort(req, ['bboName']);
      var filter = listQueryParameters.getFindCriteria(req, {doFilter: false});

      var aggregate = Blacklist.aggregate();
      if (!_.isEmpty(filter)) {
        aggregate.match(filter);
      }
      aggregate = getAggregate(true, aggregate)
          .sort(sort)
          .skip(skip)
          .limit(limit);

      Blacklist.find(filter).count(function (err, count) {
        if (err) {
          logger.error('blacklist.getList', err);
          return res.status(500).json({error: err});
        }

        aggregate.exec(function (err, data) {
          if (err) {
            logger.error('blacklists.getList', err);
            return res.status(500).json({error: err});
          }

          res.json({
            skip : skip,
            limit: limit,
            sort : sort,
            total: count,
            rows : data
          });
        });
      });
    },

    getBboNames: function (req, res) {
      var q = req.query.q || '';

      var aggregate = Blacklist.aggregate();
      if (!_.isEmpty(q)) {
        aggregate.match({bboName: {$regex: new RegExp(q, 'i')}});
      }
      getAggregate(true, aggregate)
          .project({bboName: '$bboName', _id: 0})
          .sort({bboName: -1})
          .exec(function (err, data) {
            if (err) {
              logger.error('blacklists.getBboNames', err);
              return res.status(500).json({error: err});
            }

            if (req.query.bloodhound) {
              res.json(data);
            }
            else {
              var arr = [];
              _.each(data, function (blacklist) {
                arr.push(blacklist.bboName);
              });
              res.json(arr);
            }
          });
    },

    getById: function (req, res) {
      Blacklist.findOne({_id: req.params.id}, function (err, blacklist) {
        if (err) {
          logger.error('blacklist.getById', err);
          return res.status(500).json({error: err});
        }

        if (!blacklist) {
          return res.status(404).json({_id: 'Blacklist not found.'});
        }

        res.json(blacklist);
      });
    },

    getByBboName: function (req, res) {
      Blacklist.findOne({bboName: req.params.bboName}, function (err, blacklist) {
        if (err) {
          logger.error('blacklist.getByBboName', err);
          return res.status(500).json({error: err});
        }

        if (!blacklist) {
          return res.status(404).json({bboName: 'Blacklist not found.'});
        }

        res.json(blacklist);
      });
    },

    addEntry: function (req, res) {
      var bboName = req.body.bboName;
      var td = req.body.td;
      var from = req.body.from;
      var period = req.body.for;

      Blacklist.addEntry(bboName, td, from, period, req.body.reason,
          function (err, blacklist) {
            if (err) {
              if (err.validationError) {
                return res.status(422).json(err.validationError);
              }

              logger.error('blacklist.addEntry', err);
              return res.status(500).json({error: err});
            }

            if (!blacklist) {
              return res.status(404).json({bboName: 'Blacklist not found.'});
            }

            Member.findOne({bboName: req.body.bboName}, function (err, member) {
              if (!err) {
                Member.find({role: {$in: ['admin', 'blacklist manager', 'td']}}, function (err, managers) {
                  if (err) {
                    logger.error('blacklist.addEntry::find blacklist managers', err);
                  }

                  var bcc = [];
                  if (managers) {
                    _.each(managers, function (manager) {
                      if (manager.emails && manager.emails[0]) {
                        bcc.push(manager.emails[0]);
                      }
                    });
                  }

                  if (!member) {
                    member = {
                      bboName: bboName
                    };
                  }

                  getHtml(member, blacklist, function (err, setup) {
                    if (err && setup) {
                      return logger.error('blacklist.addEntry::find email blacklist', err);
                    }

                    var to = 'info@bbofans.com';
                    if (member.emails && member.emails[0]) {
                      to = member.emails[0];
                    }

                    var email = {
                      to     : to,
                      bcc    : bcc,
                      subject: 'BBO Fans ' + setup.title,
                      html   : setup.text
                    };
                    config.servers.sendMail(email);
                  });
                });
              }

              return res.json(blacklist);
            });
          });
    },

    update: function (req, res) {
      var id = req.body._id;
      delete req.body._id;
      Blacklist.findByIdAndUpdate(id, {$set: req.body}, function (err, blacklist) {
        if (err) {
          logger.error('blacklist.update', err);
          return res.status(500).json({error: err});
        }

        if (!blacklist) {
          return res.status(404).json({_id: 'Blacklist not found.'});
        }

        res.json(blacklist);
      });
    },

    remove: function (req, res) {
      Blacklist.findOne({_id: req.params.id}, function (err, blacklist) {
        if (err) {
          logger.error('blacklist.remove', err);
          return res.status(500).json({error: err});
        }

        if (!blacklist) {
          return res.status(404).json({_id: 'Blacklist not found.'});
        }

        blacklist.remove(function (err) {
          if (err) {
            logger.error('blacklist.remove', err);
            return res.status(500).json({error: err});
          }

          res.json(200, {status: 'Success'});
        });
      });
    },

    saveAs: function (req, res) {
      var sort = listQueryParameters.getSort(req, fields);
      var filter = listQueryParameters.getFindCriteria(req, {doFilter: false});

      var aggregate = Blacklist.aggregate();
      if (!_.isEmpty(filter)) {
        aggregate.match(filter);
      }
      getAggregate(true, aggregate)
          .sort(sort)
          .exec(function (err, blacklisted) {
            if (err) {
              logger.error('blacklist.saveAs', err);
              return res.status(500).json({error: err});
            }

            // Remove _id from entries, as it's not needed.
            blacklisted.forEach(function (blacklist) {
              blacklist.entries.forEach(function (entry) {
                delete entry._id;
              });
            });

            var type = req.params.type ? req.params.type.toLowerCase() : 'text';
            exportToFile.saveAs(type, blacklisted, res);
          });
    },

    updateMembers: function (req, res) {
      var blackListedMembers = {num: 0};
      var whiteListedMembers = {num: 0};

      async.waterfall([
        getBlacklistMembers(false),
        updateMembers(false, whiteListedMembers),
        getBlacklistMembers(true),
        updateMembers(true, blackListedMembers)
      ], function (err) {
        if (err) {
          logger.error('blacklist.updateMembers', err);
          return res.status(500).json({error: err});
        }

        res.json({added: blackListedMembers.num, removed: whiteListedMembers.num});
      });
    }

  };
};
