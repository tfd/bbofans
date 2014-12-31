var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var moment = require('moment');
var o2x = require('object-to-xml');
var _ = require('underscore');

/**
 * Hashmap of field names to flat names.
 *
 * The bootstrap-table isn't able to interpret nested JSON objects so I use
 * $project to rename nested fields. This hashmap reconstructs the correct
 * nested name from the projected name.
 */
var field2FlatNames = {
  skill : 'td.skill',
  '3AM' : 'td.3AM',
  '7AM' : 'td.7AM',
  '11AM': 'td.11AM',
  '3PM' : 'td.3PM',
  '7PM' : 'td.7PM',
  '11PM': 'td.11PM',
  notes : 'td.skill'
};

/**
 * @returns {string} nested BSON name of the field.
 */
function getFieldName (name) {
  return field2FlatNames[name] || name;
}

/**
 * @returns {boolean} whether the given name is a valid field of the member collection.
 */
function isValidFieldName (name) {
  var names = [
    'bboName', 'name', 'email', 'telephone', 'skill', 'notes', '3AM', '7AM', '11AM', '3PM', '7PM', '11PM'
  ];
  return names.indexOf(name) > -1;
}

/**
 * @returns {boolean} whether the given name is a boolean field of the member collection.
 */
function isBooleanField (name) {
  var booleans = [
    '3AM', '7AM', '11AM', '3PM', '7PM', '11PM'
  ];
  return booleans.indexOf(name) > -1;
}

/**
 * @returns {boolean} whether the given name is a numeric field of the member collection.
 */
function isNumericField () {
  return false;
}

/**
 * @returns {boolean} whether the field is a date field of the meber collection
 */
function isDateField () {
  return false;
}

/**
 * @param {string} field - name of field, used to determine the variable type
 * @param {string} value - value to sanitize
 * @returns {string|number|boolean} sanitized value: only alphanumeric and spaces are allowed.
 *          Any other character is replaced with a dot so it works in a regexp.
 */
function sanitize (field, val) {
  if (isNumericField(field)) {
    return parseFloat(val);
  }
  if (isBooleanField(val)) {
    if (['yes', 'true', '1'].indexOf(val.toLowerCase()) >= 0) {
      return true;
    }
    return false;
  }
  val = val.replace(/[^a-zA-Z0-9_\s]/, ".").replace(/\s/, " ");
  return val;
}

/**
 * Read limit from the query parameters.
 *
 * @param {Object} req - query request
 * @returns {number} integer value of the limit query parameter if present, 10 otherwise.
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
 * @param {Object} req - query request
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
 * @param {Object} req - query request
 * @param {Array} fields - array of fields on which the user may sort..
 * @returns {Object} An object with the sort field name as key and 1 or -1 as value.
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
 * Constructs a mongo db filter rule for the given criteria.
 *
 * @param {string} field - name of the field
 * @param {string} criteria - a criteria
 * @param {string} value - value to check against
 * @returns {Object} the criteria rule.
 */
function getRule (field, criteria, value) {
  var values = [];
  var i = 0;

  switch (criteria) {
    case 'lte':
      return {$lte: sanitize(field, value)};
    case 'gte':
      return {$gte: sanitize(field, value)};
    case 'eq':
      return isNumericField(field) ? {$eq: sanitize(field, value)} :
             new RegExp('^' + sanitize(field, value) + '.*', 'i');
    case 'neq':
      return {$not: new RegExp('^' + sanitize(field, value) + '.*', 'i')};
    case 'cnt':
      return new RegExp(sanitize(field, value), 'i');
    case 'ncnt':
      return {$not: new RegExp(sanitize(field, value), 'i')};
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
        return {$in: values};
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
 * @param {string} field - name of field
 * @param {Object} criteria - hash with criterias for this field
 * @returns {Array} array with one element for each criteria.
 */
function getCriteria (field, criteria) {
  var arr = [];
  var type = '';
  var rule = null;
  var filter = {};

  for (type in criteria) {
    if (criteria.hasOwnProperty(type)) {
      rule = getRule(field, type, criteria[type]);
      if (rule !== null) {
        filter = {};
        filter[getFieldName(field)] = rule;
        arr.push(filter);
      }
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
 * @param {Object} req - query request
 * @param {Object} options
 * @returns {Array} an array of criterias to be applied in $and.
 */
function getFilterCriteria (req, options) {
  var criteria = [];

  if (options.doFilter === false) {
    return [];
  }

  if (typeof req.query.filter !== 'string' || req.query.filter.length === 0) {
    return [];
  }

  var filter = JSON.parse(req.query.filter);
  var key;
  for (key in filter) {
    if (filter.hasOwnProperty(key) && isValidFieldName(key)) {
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
 * @param {Object} req The http request.
 * @param {Boolean} options
 * @returns {Array} array of criterias to be applied in $and.
 */
function getSearchCriteria (req, options) {
  if (options.doSearch === false) {
    return [];
  }

  if (typeof req.query.search !== 'string' || req.query.search.length === 0) {
    return [];
  }

  var name = sanitize('bboName', req.query.search);
  var criteria = [];

  criteria.push({bboName: new RegExp(name, 'i')});
  if (options.restrictedSearch !== true) {
    criteria.push({name: new RegExp(name, 'i')});
    criteria.push({email: new RegExp(name, 'i')});
  }

  return [{$or: criteria}];
}

/**
 * Build an initial array of criteria.
 *
 * @params {Object} initialCriteria - hash with criteria.
 * @returns {Array} an array of criteria to be applied in $and.
 */
function initializeCriteria (initialCriteria) {
  if (initialCriteria) {
    if (Object.prototype.toString.call(initialCriteria) === '[object Array]') {
      return initialCriteria;
    }
    return [initialCriteria];
  }

  return [];
}

/**
 * Read filter and search from the query parameters.
 *
 * @returns {Object} an object that can be passed to mongo db find().
 */
function getFindCriterias (req, options) {
  options = options || {};
  var criteria = initializeCriteria(options.criteria);

  // Handle 'filter' query parameter
  criteria = criteria.concat(getFilterCriteria(req, options));

  // Handle 'search' query parameter
  criteria = criteria.concat(getSearchCriteria(req, options));

  return criteria.length > 0 ? criteria.length === 1 ? criteria[0] : {$and: criteria} : {};
}

function writeText (members, res) {
  var now = moment.utc().format('YYYY-MM-DD');
  res.setHeader('Content-Disposition', 'attachment; filename="tds_' + now + '.txt"');
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  members.forEach(function (member) {
    res.write(member.bboName + '\r\n');
  });
  res.end();
}

function csvEscape (val) {
  return val.replace(/"/g, '""');
}

function writeCsv (members, res) {
  var now = moment.utc().format('YYYY-MM-DD');
  res.setHeader('Content-Disposition', 'attachment; filename="tds_' + now + '.csv"');
  res.setHeader('Content-Type', 'text/csv;charset=utf-8');

  if (members.length > 0) {
    var sep = '';
    _.each(_.keys(members[0]), function (field) {
      res.write(sep + '"' + field + '"');
      sep = ',';
    });
    res.write('\r\n');

    members.forEach(function (member) {
      sep = '';
      _.each(member, function (val, field) {
        console.log(field, val);
        res.write(sep);
        if (isBooleanField(field)) {
          res.write((val ? 'Y' : 'N'));
        }
        else if (isNumericField(field)) {
          res.write(val.toFixed(2).toString());
        }
        else if (isDateField(field)) {
          res.write(moment(val).utc().format());
        }
        else {
          res.write('"' + csvEscape(val) + '"');
        }

        sep = ',';
      });
      res.write('\r\n');
    });
  }
  res.end();
}

function writeXml (members, res) {
  var obj = {
    '?xml version=\"1.0\" encoding=\"UTF-8\"?': null,
    tds                                       : {td: members}
  };

  var now = moment.utc().format('YYYY-MM-DD');
  res.setHeader('Content-Disposition', 'attachment; filename="tds_' + now + '.xml"');
  res.setHeader('Content-Type', 'application/xml;charset=utf-8');
  res.write(o2x(obj));
  res.end();
}

module.exports = {

  getAll: function (req, res) {
    var limit = getLimit(req);
    var skip = getSkip(req);
    var sort = getSort(req, ['bboName',
                             'name',
                             'telephone',
                             'email',
                             'notes',
                             '3AM',
                             '7AM',
                             '11AM',
                             '3PM',
                             '7PM',
                             '11PM']);
    var filter = getFindCriterias(req);
    Member.find(filter).count(function (err, count) {
          if (err) { console.error('tournamentDirectors.getAll', err); }
          Member.aggregate([
                {$match: filter},
                {
                  $project: {
                    bboName  : 1,
                    name     : 1,
                    email    : 1,
                    telephone: 1,
                    skill    : '$' + getFieldName('skill'),
                    notes    : '$' + getFieldName('notes'),
                    '3AM'    : '$' + getFieldName('3AM'),
                    '7AM'    : '$' + getFieldName('7AM'),
                    '11AM'   : '$' + getFieldName('11AM'),
                    '3PM'    : '$' + getFieldName('3PM'),
                    '7PM'    : '$' + getFieldName('7PM'),
                    '11PM'   : '$' + getFieldName('11PM')
                  }
                },
                {$sort: sort},
                {$skip: skip},
                {$limit: limit}
              ],
              function (err, tds) {
                if (err) { console.error('tournamentDirectors.getAll', err); }
                res.json({
                  skip : skip,
                  limit: limit,
                  sort : sort,
                  total: count,
                  rows : tds
                });
              }
          );
        }
    );
  },

  getById: function (req, res) {
    Member.aggregate([
      {$match: {_id: req.params.id}},
      {
        $project: {
          bboName  : 1,
          name     : 1,
          email    : 1,
          telephone: 1,
          skill    : '$' + getFieldName('skill'),
          notes    : '$' + getFieldName('notes'),
          '3AM'    : '$' + getFieldName('3AM'),
          '7AM'    : '$' + getFieldName('7AM'),
          '11AM'   : '$' + getFieldName('11AM'),
          '3PM'    : '$' + getFieldName('3PM'),
          '7PM'    : '$' + getFieldName('7PM'),
          '11PM'   : '$' + getFieldName('11PM')
        }
      }
    ], function (err, td) {
      if (err) {
        if (err) { console.error('tournamentDirectors.getById', err); }
        res.status(500).json({error: err});
      }
      else if (td === null) {
        res.status(404).json({error: 'TD not found.'});
      }
      else {
        res.json(td);
      }
    });
  },

  update: function (req, res) {
    var id = req.body._id;
    delete req.body._id;
    Member.findByIdAndUpdate(id, {$set: req.body}, function (err, updated) {
      if (err) {
        console.error('tournamentDirectors.update', err);
        res.json({error: 'Error updating TD.'});
      }
      else {
        res.json(updated);
      }
    });
  },

  export: function (req, res) {
    var sort = getSort(req, ['bboName',
                             'name',
                             'email',
                             'telephone',
                             'skill',
                             'notes',
                             '3AM',
                             '7AM',
                             '11AM',
                             '3PM',
                             '7PM',
                             '11PM'
    ]);
    var filter = getFindCriterias(req);
    Member.find(filter).count(function (err) {
          if (err) { console.error('members.getAll', err); }
          Member.aggregate([
                {$match: filter},
                {
                  $project: {
                    _id      : 0,
                    bboName  : 1,
                    name     : 1,
                    email    : 1,
                    telephone: 1,
                    skill    : '$' + getFieldName('skill'),
                    notes    : '$' + getFieldName('notes'),
                    '3AM'    : '$' + getFieldName('3AM'),
                    '7AM'    : '$' + getFieldName('7AM'),
                    '11AM'   : '$' + getFieldName('11AM'),
                    '3PM'    : '$' + getFieldName('3PM'),
                    '7PM'    : '$' + getFieldName('7PM'),
                    '11PM'   : '$' + getFieldName('11PM')
                  }
                },
                {$sort: sort}
              ],
              function (err, tds) {
                if (err) { console.error('tournamentDirectors.export', err); }

                var type = req.params.type ? req.params.type.toLowerCase() : 'text';
                switch (type) {
                  case 'json':
                    var now = moment.utc().format('YYYY-MM-DD');
                    res.setHeader('Content-Disposition', 'attachment; filename="tds_' + now + '.json"');
                    res.json({members: tds});
                    break;

                  case 'xml' :
                    writeXml(tds, res);
                    break;

                  case 'csv' :
                    writeCsv(tds, res);
                    break;

                  default:
                    writeText(tds, res);
                    break;
                }
              }
          );
        }
    );
  }

}
;
