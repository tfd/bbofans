/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Blacklist = mongoose.model('Blacklist');
var moment = require('moment');
var async = require('async');
var fields = ['bboName'];
var fieldDefinitions = require('../utils/fieldDefinitions')(Blacklist, fields);
var listQueryParameters = require('../utils/listQueryParameters')(fieldDefinitions);
var exportToFile = require('../utils/exportToFile')('blacklist', 'member', fieldDefinitions);
var _ = require('underscore');

module.exports = function () {

  function findBlacklistedMembers(Members) {
    return function (cb) {
      Members.find({isBlackListed: true}, {_id: 0, bboName: 1}).exec(cb);
    };
  }

  function updateOrCreateBlacklist(member) {
    return function (blacklist, cb) {
      var now = moment.utc();
      var expire = now.add(1, 'M');
      if (blacklist) {
        var ok = false;
        blacklist.entries.forEach(function (row) {
          if (row.from <= now && row.to >= now) { ok = true; }
        });
        if (ok) {
          cb(null, blacklist);
        }
        else {
          blacklist.entries.push({from: now, to: expire, reason: "Automatic update from Members collection."});
          blacklist.save(cb);
        }
      }
      else {
        blacklist = new Blacklist({bboName: member.bboName, entries: []});
        blacklist.entries.push({from: now, to: expire, reason: "Automatic add from Members collection."});
        blacklist.save(cb);
      }
    };
  }

  function findBlacklist(bboName) {
    return function (cb) {
      Blacklist.findOne({bboName: bboName}, cb);
    };
  }

  function addMemberToBlacklist(member, cb) {
    async.waterfall(
        [
          findBlacklist(member.bboName),
          updateOrCreateBlacklist(member.bboName)
        ],
        cb
    );
  }

  function addMembersToBlacklist(members, cb) {
    async.map(members, addMemberToBlacklist, cb);
  }

  function initCollection(cb) {
    // Synchronize with Member.isBlackListed
    var Members = mongoose.model('Member');
    async.waterfall(
        [
          findBlacklistedMembers(Members),
          addMembersToBlacklist
        ],
        cb
    );
  }

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

  return {

    getList: function (req, res) {
      var now = moment.utc();
      var limit = listQueryParameters.getLimit(req);
      var skip = listQueryParameters.getSkip(req);
      var sort = listQueryParameters.getSort(req, ['bboName']);
      var filter = listQueryParameters.getFindCriteria(req, {doFilter: false});

      var aggr = [];
      if (!_.isEmpty(filter)) {
        aggr.push({$match: filter});
      }
      aggr.push({$project: {_id: {_id: '$_id', bboName: '$bboName', entries: '$entries'}, entries: '$entries'}});
      aggr.push({$unwind: '$entries'});
      aggr.push({$group: {_id: '$_id', entries: {$last: '$entries'}}});
      aggr.push({$match: {'entries.from': {$lte: now.toDate()}, 'entries.to': {$gte: now.toDate()}}});
      aggr.push({$project: {_id: '$_id._id', bboName: '$_id.bboName', entries: '$_id.entries'}});
      aggr.push({$sort: sort});
      aggr.push({$skip: skip});
      aggr.push({$limit: limit});

      Blacklist.find(filter).count(function (err, count) {
        if (err) {
          console.err('blacklist.getList', err);
          return res.status(500).json({error: err});
        }

        Blacklist.aggregate(aggr, function (err, data) {
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
      Blacklist.addEntry(req.body.bboName, req.body.from, req.body.for, req.body.reason, function (err, blacklist) {
        if (err) {
          console.error('blacklist.addEntry', err);
          return res.status(500).json({error: err});
        }

        if (!blacklist) {
          return res.status(404).json({bboName: 'Blacklist not found.'});
        }

        res.json(blacklist);
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
      var now = moment.utc();
      var sort = listQueryParameters.getSort(req, fields);
      var filter = listQueryParameters.getFindCriteria(req, {doFilter: false});

      var aggr = [];
      if (!_.isEmpty(filter)) {
        aggr.push({$match: filter});
      }
      aggr.push({$project: {_id: {bboName: '$bboName', entries: '$entries'}, entries: '$entries'}});
      aggr.push({$unwind: '$entries'});
      aggr.push({$group: {_id: '$_id', entries: {$last: '$entries'}}});
      aggr.push({$match: {'entries.from': {$lte: now.toDate()}, 'entries.to': {$gte: now.toDate()}}});
      aggr.push({$project: {_id: 0, bboName: '$_id.bboName', entries: '$_id.entries'}});
      aggr.push({$sort: sort});

      Blacklist.aggregate(aggr, function (err, blacklisted) {
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
    }

  };
};
