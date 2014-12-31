var mongoose = require('mongoose');
var recaptcha = require('../controllers/recaptcha');
var Blacklist = mongoose.model('Blacklist');
var moment = require('moment');
var async = require('async');
var o2x = require('object-to-xml');

function findBlacklistedMembers (Members) {
  return function (cb) {
    Members.find({isBlackListed: true}, {_id: 0, bboName: 1}).exec(cb);
  };
}

function updateOrCreateBlacklist (bboName) {
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
      blacklist = new Blacklist({bboName: bboName, entries: []});
      blacklist.entries.push({from: now, to: expire, reason: "Automatic add from Members collection."});
      blacklist.save(cb);
    }
  };
}

function findBlacklist (bboName) {
  return function (cb) {
    Blacklist.findOne({bboName: bboName}, cb);
  };
}

function addMemberToBlacklist (member, cb) {
  async.waterfall(
      [
        findBlacklist(member.bboName),
        updateOrCreateBlacklist(member.bboName)
      ],
      cb
  );
}

function addMembersToBlacklist (members, cb) {
  async.map(members, addMemberToBlacklist, cb);
}

function initCollection (cb) {
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

/**
 * @params {String} val - value to sanitize
 * @returns {String} a sanitized value: only alphanumeric and spaces are allowed.
 *          Any other character is replaced with a dot so it works in a regexp.
 */
function sanitize (val) {
  val = val.replace(/[^a-zA-Z0-9_\s]/, ".").replace(/\s/, " ");
  return val;
}

/**
 * Read limit from the query parameters.
 *
 * @returns The integer value of the limit query parameter if present, 10 otherwise.
 */
function getLimit (req) {
  var limit = 10;
  if (req.query.limit) {
    limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 10) {
      limit = 10;
    }
    else if (limit > 100) {
      limit = 100;
    }
  }
  return limit;
}

/**
 * Read offset from the query parameters.
 *
 * @returns The integer value of the offset query parameter if present, 0 otherwise.
 */
function getSkip (req) {
  var skip = 0;
  if (req.query.offset) {
    skip = parseInt(req.query.offset, 10);
    if (isNaN(skip) || skip < 0) {
      skip = 0;
    }
  }
  return skip;
}


/**
 * Read sort and order from the query parameters.
 *
 * @returns An object with the sort field name as key and 1 or -1 as value.
 */
function getSort (req, fields) {
  var sort = {};
  var field = 'bboName';
  var order = 'asc';
  if (req.query.sort && fields.indexOf(req.query.sort) >= 0) {
    field = req.query.sort;
  }
  if (req.query.order && ['asc', 'desc'].indexOf(req.query.order) >= 0) {
    order = req.query.order;
  }
  sort[field] = (order === 'asc' ? 1 : -1);
  return sort;
}

/**
 * Read search query parameter.
 *
 * This is a simple text field that does a contains search on the bboName, name, and email fields.
 *
 * @param req {Object} The http request.
 * @returns {Object} array of criterias to be applied in $and.
 */
function getSearchCriteria (req) {
  if (typeof req.query.search !== 'string' || req.query.search.length === 0) {
    return null;
  }

  var name = sanitize(req.query.search);

  return {bboName: new RegExp(name, 'i')};
}

function writeText (blacklist, res) {
  var now = moment.utc().format('YYYY-MM-DD');
  res.setHeader('Content-Disposition', 'attachment; filename="blacklist_' + now + '.txt"');
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  blacklist.forEach(function (val) {
    res.write(val.bboName + '\r\n');
  });
  res.end();
}

function csvEscape (val) {
  return val.replace(/"/g, '""');
}

function writeCsv (blacklist, res) {
  var now = moment.utc().format('YYYY-MM-DD');
  res.setHeader('Content-Disposition', 'attachment; filename="blacklist_' + now + '.csv"');
  res.setHeader('Content-Type', 'text/csv;charset=utf-8');
  res.write('bboName,from,to,reason\r\n');
  blacklist.forEach(function (val) {
    var lastEntry = val.entries[val.entries.length - 1];
    res.write('"' + csvEscape(val.bboName) + '",');
    res.write(moment(lastEntry.from).utc().format() + ',');
    res.write(moment(lastEntry.to).utc().format() + ',');
    res.write('"' + csvEscape(lastEntry.reason) + '"\r\n');
  });
  res.end();
}

function writeXml (blacklist, res) {
  blacklist.forEach(function (member) {
    var entry = member.entries;
    member.entries = {entry: entry};
  });

  console.log(blacklist);
  var obj = {
    '?xml version=\"1.0\" encoding=\"UTF-8\"?': null,
    blacklist                                 : {member: blacklist}
  };

  var now = moment.utc().format('YYYY-MM-DD');
  res.setHeader('Content-Disposition', 'attachment; filename="blacklist_' + now + '.xml"');
  res.setHeader('Content-Type', 'application/xml;charset=utf-8');
  res.write(o2x(obj));
  res.end();
}

module.exports = {

  getList: function (req, res) {
    var now = moment.utc();
    var limit = getLimit(req);
    var skip = getSkip(req);
    var sort = getSort(req, ['bboName']);
    var filter = getSearchCriteria(req);

    var aggr = [];
    if (filter) {
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
      if (err) { console.err('blacklist.getList', err); }
      Blacklist.aggregate(aggr, function (err, data) {
        if (err) { console.error('blacklists.getList', err); }
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
    Blacklist.findOne({_id: req.params.id}).exec(function (err, blacklist) {
      if (err) {
        console.error('blacklist.getById', err);
        res.status(500).json({error: err});
      }
      else if (blacklist === null) {
        res.status(404).json({error: 'Blacklist not found.'});
      }
      else {
        res.json(blacklist);
      }
    });
  },

  getByBboName: function (req, res) {
    Blacklist.findOne({bboName: req.query.bboName}).exec(function (err, blacklist) {
      if (err) {
        console.error('blacklist.getByBboName', err);
        res.status(500).json({error: err});
      }
      else if (blacklist === null) {
        res.status(404).json({error: 'Blacklist not found.'});
      }
      else {
        res.json(blacklist);
      }
    });
  },

  addEntry: function (req, res) {
    Blacklist.addEntry(req.body.bboName, req.body.from, req.body.for, req.body.reason, function (err, blacklist) {
      if (err) {
        console.error('blacklist.addEntry', err);
        res.status(409).json(err);
      }
      else {
        res.json(blacklist);
      }
    });
  },

  update: function (req, res) {
    var id = req.body._id;
    delete req.body._id;
    Blacklist.findByIdAndUpdate(id, {$set: req.body}, function (err, updated) {
      if (err) {
        console.error('blacklist.update', err);
        res.json({error: 'Error updating blacklist.'});
      }
      else {
        res.json(updated);
      }
    });
  },

  delete: function (req, res) {
    Blacklist.findOne({_id: req.params.id}, function (err, blacklist) {
      if (err) {
        console.error('blacklist.delete', err);
        res.json({error: 'Blacklist not found.'});
      }
      else {
        blacklist.remove(function (err, player) {
          res.json(200, {status: 'Success'});
        });
      }
    });
  },

  export: function (req, res) {
    var now = moment.utc();
    var sort = getSort(req, ['bboName']);
    var filter = getSearchCriteria(req);

    var aggr = [];
    if (filter) {
      aggr.push({$match: filter});
    }
    aggr.push({$project: {_id: {bboName: '$bboName', entries: '$entries'}, entries: '$entries'}});
    aggr.push({$unwind: '$entries'});
    aggr.push({$group: {_id: '$_id', entries: {$last: '$entries'}}});
    aggr.push({$match: {'entries.from': {$lte: now.toDate()}, 'entries.to': {$gte: now.toDate()}}});
    aggr.push({$project: {_id: 0, bboName: '$_id.bboName', entries: '$_id.entries'}});
    aggr.push({$sort: sort});

    Blacklist.aggregate(aggr, function (err, blacklisted) {
      if (err) { console.error('blacklist.export', err); }

      // Remove _id from entries, as it's not needed.
      blacklisted.forEach(function (blacklist) {
        blacklist.entries.forEach(function (entry) {
          delete entry._id;
        });
      });

      var type = req.params.type ? req.params.type.toLowerCase() : 'text';
      switch (type) {
        case 'json':
          var now = moment.utc().format('YYYY-MM-DD');
          res.setHeader('Content-Disposition', 'attachment; filename="blacklist_' + now + '.json"');
          res.json({blacklist: blacklisted});
          break;

        case 'xml' :
          writeXml(blacklisted, res);
          break;

        case 'csv' :
          writeCsv(blacklisted, res);
          break;

        default:
          writeText(blacklisted, res);
          break;
      }
    });
  }

};
