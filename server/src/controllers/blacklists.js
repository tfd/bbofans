var mongoose = require('mongoose');
var recaptcha = require('../controllers/recaptcha');
var Blacklist = mongoose.model('Blacklist');
var moment = require('moment');
var async = require('async');

function initCollection (cbInit) {
  // Synchronize with Member.isBlackListed
  var Members = mongoose.model('Member');
  async.waterfall(
    [
      function findBlacklistedMembers(cb) {
        Members.find({isBlackListed: true}, {_id: 0, bboName: 1}).exec(cb);
      },
      function forEachMember(members, cbMembers) {
        async.map(members,
          function addMemberToBlacklist(member, cbMember) {
            async.waterfall(
              [
                function findBlacklist(cbFind) {
                  Blacklist.findOne({bboName: member.bboName}, cbFind);
                },
                function updateOrCreateBlacklist(blacklist, cbBlacklist) {
                  var now = moment();
                  var expire = moment().add(1, 'M');
                  if (blacklist) {
                    var ok = false;
                    blacklist.entries.forEach(function (row){
                      if (row.from <= now && row.to >= now) { ok = true; }
                    });
                    if (ok) {
                      cbBlacklist(null, blacklist);
                    }
                    else {
                      blacklist.entries.push({ from: now, to: expire, reason: "Automatic update from Members collection."});
                      blacklist.save(cbBlacklist);
                    }
                  }
                  else {
                    blacklist = new Blacklist({ bboName: member.bboName, entries: [] });
                    blacklist.entries.push({ from: now, to: expire, reason: "Automatic add from Members collection."});
                    blacklist.save(cbBlacklist);
                  }
                }
              ],
              cbMember
            );
          },
          cbMembers
        );
      }
    ],
    cbInit
  );
}

initCollection( function (err, blacklists) {
  if (err) { console.log("initCollection", err); }
});

/**
 * @returns a sanitized value: only alphanumeric and spaces are allowed.
 *          Any other character is replaced with a dot so it works in a regexp.
 */
function sanitize(field, val) {
  val = val.replace( /[^a-zA-Z0-9_\s]/, ".").replace( /\s/, " ");
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
 * @param req {Objec} The http request.
 * @param restricted {Boolean} Set to true to exclude email from the search
 * @returns array of criterias to be applied in $and.
 */
function getSearchCriteria(req, options) {
  if (options.doSearch === false) {
    return [];
  }

  if (typeof req.query.search !== 'string' || req.query.search.length === 0) {
    return [];
  }
  
  var name = sanitize('bboName', req.query.search);
  var criteria = [];

  criteria.push({ bboName: new RegExp(name, 'i')});

  return criteria;
}

/**
 * Build an initial array of criteria.
 *
 * @returns an array of criteria to be applied in $and.
 */
function initializeCriteria(initialCriteria) {
  if (initialCriteria) {
    if (Object.prototype.toString.call(initialCriteria) === '[object Array]') {
      return initialCriteria;
    }
    else {
      return [initialCriteria];
    }
  }

  return [];
}

/**
 * Read search from the query parameters.
 *
 * @returns an object that can be passed to mongo db find().
 */
function getFindCriterias(req, options)
{
  options = options || {};
  var criteria = initializeCriteria(options.criteria);

  // Handle 'search' query parameter
  criteria = criteria.concat(getSearchCriteria(req, options));

  return criteria.length > 0 ? criteria.length === 1 ? criteria[0] : { $and : criteria } : {};
}

module.exports = {
  
  getList: function (req, res) {
    var limit = getLimit(req);
    var skip = getSkip(req);
    var sort = getSort(req, ['bboName']);
    var filter = getFindCriterias(req, { doFilter: false });
    Blacklist.find(filter).count(function (err, count) {
      Blacklist.find(filter)
               .sort(sort)
               .skip(skip)
               .limit(limit)
               .exec(function (err, data) {
        res.json({
          skip: skip,
          limit: limit,
          sort: sort,
          total: count,
          rows: data
        });
      });
    });
  },

  getById: function (req, res) {
    Blacklist.findOne({ _id: req.params.id }).exec(function (err, blacklist) {
      if (err) {
        console.log('getById', err);
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
    Blacklist.findOne({ bboName: req.query.bboName }).exec(function (err, blacklist) {
      if (err) {
        console.log('getByBboName', err);
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

  addEntry: function(req, res) {
    Blacklist.addEntry(req.body.bboName, req.body.from, req.body.for, req.body.reason, function (err, blacklist) {
      if (err) {
        res.status(409).json(err);
      }
      else {
        res.json(blacklist);
      }
    });
  },
  
  update: function(req, res) {
    var id = req.body._id;
    delete req.body._id;
    Blacklist.findByIdAndUpdate(id, { $set: req.body }, function (err, updated) {
      if (err) {
        console.log("update", err);
        res.json({error: 'Error updating blacklist.'});
      } else {
        res.json(updated);
      }
    });
  },

  delete: function(req, res) {
    Blacklist.findOne({ _id: req.params.id }, function (err, blacklist) {
      if (err) {
        console.log("delete", err);
        res.json({error: 'Blacklist not found.'});
      } else {
        blacklist.remove(function(err, player){
          res.json(200, {status: 'Success'});
        });
      }
    });
  }

};
