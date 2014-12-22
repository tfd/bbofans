var mongoose = require('mongoose');
var recaptcha = require('../controllers/recaptcha');
var Member = mongoose.model('Member');

/**
 * Hashmap of field names to flat names.
 *
 * The bootstrap-table isn't able to interpret nested JSON objects so I use
 * $project to rename nested fields. This hashmap reconstructs the correct
 * nested name from the projected name.
 */
var field2FlatNames = {
  'rockNumTournaments': 'rock.totalScores.numTournaments',
  'rockAverageScore': 'rock.totalScores.averageScore',
  'rockAverageMatchPoints': 'rock.totalScores.averageMatchPoints',
  'rockAwards': 'rock.totalScores.awards',
  'rbdNumTournaments': 'rbd.totalScores.numTournaments',
  'rbdAverageScore': 'rbd.totalScores.averageScore',
  'rbdAverageMatchPoints': 'rbd.totalScores.averageMatchPoints',
  'rbdAwards': 'rbd.totalScores.awards'
};

/**
 * @returns nested BSON name of the field.
 */
function getFieldName(name) {
  return (field2FlatNames[name] ? field2FlatNames[name] : name);
}

/**
 * @returns whether the given name is a valid field of the members collection.
 */
function isValidFieldName(name) {
  var names = [
    'bboName', 'name', 'nation', 'email', 'level',
    'isStarPlayer', 'isRbdPlayer', 'isEnabled', 'isBlackListed', 'isBanned',
    'rockNumTournaments',
    'rockAverageScore',
    'rockAverageMatchPoints',
    'rockAwards',
    'rbdNumTournaments',
    'rbdAverageScore',
    'rbdAverageMatchPoints',
    'rbdAwards'
  ];
  return names.indexOf(name) > -1;
}

/**
 * @returns whether the given name is a boolean field of the members collection.
 */
function isBooleanField(name) {
  var booleans = [
    'isStarPlayer', 'isRbdPlayer', 'isEnabled', 'isBlackListed', 'isBanned'
  ];
  return booleans.indexOf(name) > -1;
}

/**
 * @returns whether the given name is a numeric field of the members collection.
 */
function isNumericField(name) {
  var names = [
    'rockNumTournaments',
    'rockAverageScore',
    'rockAverageMatchPoints',
    'rockAwards',
    'rbdNumTournaments',
    'rbdAverageScore',
    'rbdAverageMatchPoints',
    'rbdAwards'
  ];
  return names.indexOf(name) > -1;
}

/**
 * @returns a sanitized value: only alphanumeric and spaces are allowed.
 *          Any other character is replaced with a dot so it works in a regexp.
 */
function sanitize(field, val) {
  if (isNumericField(field)) {
    return parseFloat(val);
  }
  if (isBooleanField(val)) {
    if (['yes', 'true', '1'].indexOf(val.toLowerCase()) >= 0) return true;
    return false;
  }
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
 * Get a single criteria rule.
 *
 * Costructs a mongo db filter rule for the given criteria.
 *
 * @returns the criteria rule.
 */
function getRule(field, criteria, value) {
  var values = [];
  var i = 0;

  switch (criteria) {
    case 'lte': return { $lt : sanitize(field, value) };
    case 'gte': return { $gt : sanitize(field, value) };
    case 'eq': return isNumericField(field) ? { $eq : sanitize(field, value) } : new RegExp('^' + sanitize(field, value) + '.*', 'i');
    case 'neq': return { $not : new RegExp('^' + sanitize(field, value) + '.*', 'i') };
    case 'cnt': return new RegExp(sanitize(field, value), 'i');
    case 'ncnt': return { $not : new RegExp(sanitize(field, value), 'i') };
    case '_values':
      if (Object.prototype.toString.call(value) === '[object Array]') {
        if (value.indexOf('ept') >= 0) {
          return new RegExp('^$');
        }
        if (value.indexOf('nept') >= 0) {
          return new RegExp('.+');
        }

        values = [];
        for (i = 0; i < value.length; ++i) {
          if (value[i]) {
            values.push(sanitize(field, value[i]));
          }
        } 
        return { $in : values };
      }
      break;
  }
  return null;
}

/**
 * Read filter criteria for a field.
 *
 * A criteria is an object that can have one or more of the following fields:
 *
 * eq: begins with
 * neq: doesn't begin with
 * cnt: contains anywhere in the string
 * ncnt: doesn't contain
 * lte: less then
 * gte: greater then
 * _values: list of accpeted values. The values "ept" and "nept" have the special meaning
 *          "empty" and "not empty".
 *
 * @returns an array with one element for each criteria.
 */
function getCriteria(field, criteria) {
  var arr = [];

  for (var type in criteria) {
    var rule = getRule(field, type, criteria[type]);
    if (rule !== null) {
      var filter = {};
      filter[getFieldName(field)] = rule;
      arr.push(filter);
    }
  }

  return arr;
}

/**
 * Read filter object from the query parameters.
 *
 * The filter is a JSON string of an object that has a key for each filtered field and an
 * object that holds the criteria. The criteria can have the following fields:
 *
 * eq: begins with
 * neq: doesn't begin with
 * cnt: contains anywhere in the string
 * ncnt: doesn't contain
 * lte: less then
 * gte: greater then
 * _values: list of accpeted values. The values "ept" and "nept" have the special meaning
 *          "empty" and "not empty".
 *
 * Boolean values are written as strings "false" and "true". Obviously a boolean criteria
 * of { _values: ['true', 'false'] } is legal but doesn't make sense and is eliminated from
 * the resulting filter.
 *
 * @returns an array of criterias to be applied in $and.
 */
function getFilterCriteria(req, options) {
  var criteria = [];

  if (options.doFilter === false) {
    return [];
  }

  if (typeof req.query.filter !== 'string' || req.query.filter.length === 0) {
    return [];
  }

  var filter = JSON.parse(req.query.filter);
  for (var key in filter) {
    if (isValidFieldName(key)) {
      criteria = criteria.concat(getCriteria(key, filter[key]));
    }
  }

  return criteria;
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
  if (options.restrictedSearch !== true) {
    criteria.push({ name: new RegExp(name, 'i')});
    criteria.push({ email: new RegExp(name, 'i')});
  }

  return [{ $or : criteria }];
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
 * Read filter and search from the query parameters.
 *
 * @returns an object that can be passed to mongo db find().
 */
function getFindCriterias(req, options)
{
  options = options || {};
  var criteria = initializeCriteria(options.criteria);

  // Handle 'filter' query parameter
  criteria = criteria.concat(getFilterCriteria(req, options));

  // Handle 'search' query parameter
  criteria = criteria.concat(getSearchCriteria(req, options));

  return criteria.length > 0 ? criteria.length === 1 ? criteria[0] : { $and : criteria } : {};
}

module.exports = {
  
  index: function (req, res) {
    Member.find({}, function (err, data) {
      res.json(data);
    });
  },
  
  getRock: function (req, res) {
    var limit = getLimit(req);
    var skip = getSkip(req);
    var sort = getSort(req, ['bboName', 'nation', 'level', 'awards', 'averageMatchPoints']);
    var filter = getFindCriterias(req, {doFilter: false, restrictedSearch: true});
    Member.find(filter).count(function (err, count) {
      Member.aggregate([
              { $match: filter },
              { $project: {
                  bboName: 1,
                  nation: 1,
                  level: 1,
                  awards: "$rock.totalScores.awards",
                  averageMatchPoints: "$rock.totalScores.averageMatchPoints"
                }
              }
             ])
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
  
  getRbd: function (req, res) {
    var limit = getLimit(req);
    var skip = getSkip(req);
    var sort = getSort(req, ['bboName', 'nation', 'level', 'awards', 'averageMatchPoints']);
    var filter = getFindCriterias(req, {criteria: { isRbdPlayer: true }, doFilter: false, restrictedSearch: true});
    Member.find(filter).count(function (err, count) {
      Member.aggregate([
              { $match: filter },
              { $project: {
                  bboName: 1,
                  nation: 1,
                  level: 1,
                  awards: "$rbd.totalScores.awards",
                  averageMatchPoints: "$rbd.totalScores.averageMatchPoints"
                }
              }
             ])
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
  
  getAll: function (req, res) {
    var limit = getLimit(req);
    var skip = getSkip(req);
    var sort = getSort(req, ['bboName', 'name', 'nation', 'level', 'email',
      'isStarPlayer', 'isRbdPlayer', 'isEnabled', 'isBlackListed', 'isBanned',
      'rockLastPlayedAt', 'rockNumTournaments', 'rockAverageScore', 'rockAverageMatchPoints', 'rockAwards',
      'rbdLastPlayedAt', 'rbdNumTournaments', 'rbdAverageScore', 'rbdAverageMatchPoints', 'rbdAwards',
      'registeredAt', 'validatedAt']);
    var filter = getFindCriterias(req);
    Member.find(filter).count(function (err, count) {
      Member.aggregate([
              { $match: filter },
              { $project: {
                  bboName: 1,
                  name: 1,
                  nation: 1,
                  level: 1,
                  email: 1,
                  isStarPlayer: 1,
                  isRbdPlayer: 1,
                  isEnabled: 1,
                  isBlackListed: 1,
                  isBanned: 1,
                  rockLastPlayedAt: '$rock.lastPlayedAt',
                  rockNumTournaments: '$rock.totalScores.numTournaments',
                  rockAverageScore: '$rock.totalScores.averageScore',
                  rockAverageMatchPoints: '$rock.totalScores.averageMatchPoints',
                  rockAwards: '$rock.totalScores.awards',
                  rbdLastPlayedAt: '$rbd.lastPlayedAt',
                  rbdNumTournaments: '$rbd.totalScores.numTournaments',
                  rbdAverageScore: '$rbd.totalScores.averageScore',
                  rbdAverageMatchPoints: '$rbd.totalScores.averageMatchPoints',
                  rbdAwards: '$rbd.totalScores.awards',
                  registeredAt: 1,
                  validatedAt: 1
                }}
             ])
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
    Member.findOne({ _id: req.params.id }, function (err, player) {
      if (err) {
        res.status(500).json({error: err});
      }
      else if (player === null) {
        res.status(404).json({error: 'Member not found.'});
      }
      else {
        res.json(player);
      }
    });
  },
  
  register: function(req, res) {
    var member = req.body;
    recaptcha.checkDirect(req, member.recaptcha_challenge_field, member.recaptcha_response_field, function (data) {
      if (data.passed === false) {
        res.status(403).json({errors: {recaptcha: data.error}});
      }
      else {
        var newMember = new Member(req.body);
        newMember.save(function (err, player) {
          if (err) {
            var error = err.err.toString();
            if (error.indexOf('E11000 duplicate key error') === 0) {
              var fieldName = error.match(/members\.\$(.*)_\d/i)[1];
              var fieldValue = error.match(/dup\skey:\s\{\s:\s\"(.*)\"\s\}/)[1];
              var errors = {};
              errors[fieldName] = 'Value "' + fieldValue + '" already present in database';
              res.status(409).json(errors);
            }
            else {
              console.log(err);
              res.status(422).json({bboName: error});
            }
          } else {
            res.json(player);
          }
        });
      }
    });
  },
  
  add: function(req, res) {
    delete req.body.recaptcha_challenge_field;
    delete req.body.recaptcha_response_field;
    if (req.body._id) {
      // Existing member, update!
      this.update(req, res);
    }
    else {
      // New member, save it.
      var member = new Member(req.body);
      member.save(function (err, player) {
        if (err) {
          var error = err.err.toString();
          if (error.indexOf('E11000 duplicate key error') === 0) {
            var fieldName = error.match(/members\.\$(.*)_\d/i)[1];
            var fieldValue = error.match(/dup\skey:\s\{\s:\s\"(.*)\"\s\}/)[1];
            var errors = {};
            errors[fieldName] = 'Value "' + fieldValue + '" already present in database';
            res.status(409).json(errors);
          }
          else {
            console.log(err);
            res.status(422).json({bboName: error});
          }
        } else {
          res.json(player);
        }
      });
    }
  },
  
  update: function(req, res) {
    var id = req.body._id;
    delete req.body._id;
    delete req.body.recaptcha_challenge_field;
    delete req.body.recaptcha_response_field;
    Member.findByIdAndUpdate(id, { $set: req.body }, function (err, updated) {
      if (err) {
        res.json({error: 'Error updating member.'});
      } else {
        res.json(updated);
      }
    });
  },

  delete: function(req, res) {
    Member.findOne({ _id: req.params.id }, function (err, player) {
      if (err) {
        res.json({error: 'Member not found.'});
      } else {
        player.remove(function(err, player){
          res.json(200, {status: 'Success'});
        });
      }
    });
  }

};
