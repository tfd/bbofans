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
          console.err('blacklist.getList', err);
          return res.status(500).json({error: err});
        }

        aggregate.exec(function (err, data) {
          if (err) {
            console.error('blacklists.getList', err);
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
              console.error('blacklists.getBboNames', err);
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
          console.error('blacklist.getById', err);
          return res.status(500).json({error: err});
        }

        if (!blacklist) {
          return res.status(404).json({_id: 'Blacklist not found.'});
        }

        res.json(blacklist);
      });
    },

    getByBboName: function (req, res) {
      Blacklist.findOne({bboName: req.query.bboName}, function (err, blacklist) {
        if (err) {
          console.error('blacklist.getByBboName', err);
          return res.status(500).json({error: err});
        }

        if (!blacklist) {
          return res.status(404).json({bboName: 'Blacklist not found.'});
        }

        res.json(blacklist);
      });
    },

    addEntry: function (req, res) {
      Blacklist.addEntry(req.body.bboName, req.body.td, req.body.from, req.body.for, req.body.reason,
          function (err, blacklist) {
            if (err) {
              if (err.validationError) {
                return res.status(422).json(err.validationError);
              }

              console.error('blacklist.addEntry', err);
              return res.status(500).json({error: err});
            }

            if (!blacklist) {
              return res.status(404).json({bboName: 'Blacklist not found.'});
            }

            Member.findOne({bboName: req.body.bboName}, function (err, member) {
              if (!err && member) {
                config.servers.sendMail({
                  to     : blacklist.emails[0],
                  subject: '[BBO Fans] Blacklist',
                  text   : getText(member),
                  html   : getHtml(member)
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
          console.error('blacklist.update', err);
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
          console.error('blacklist.remove', err);
          return res.status(500).json({error: err});
        }

        if (!blacklist) {
          return res.status(404).json({_id: 'Blacklist not found.'});
        }

        blacklist.remove(function (err) {
          if (err) {
            console.error('blacklist.remove', err);
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
              console.error('blacklist.saveAs', err);
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
          console.error('blacklist.updateMembers', err);
          return res.status(500).json({error: err});
        }

        res.json({added: blackListedMembers.num, removed: whiteListedMembers.num});
      });
    }

  };
};
