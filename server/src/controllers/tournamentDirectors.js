var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var moment = require('moment');
var o2x = require('object-to-xml');
var _ = require('underscore');

var fields = ['bboName',
              'name',
              'email',
              'telephone',
              'skill',
              'info',
              'h3am',
              'h7am',
              'h11am',
              'h3pm',
              'h7pm',
              'h11pm'];

/**
 * Return the name of the field.
 *
 * This can be a nested field name.
 *
 * @param {String} field - the simple field name
 * @returns {String} the real field name
 */
function getFieldName (field) {
  return field;
}

/**
 * @returns {boolean} whether the given name is a valid field of the member collection.
 */
function isValidFieldName (name) {
  return fields.indexOf(name) > -1;
}

/**
 * @returns {boolean} whether the given name is a boolean field of the member collection.
 */
function isBooleanField (name) {
  return Member.schema.path(name) instanceof mongoose.Schema.Types.Boolean;
}

/**
 * @returns {boolean} whether the given name is a numeric field of the member collection.
 */
function isNumericField () {
  return Member.schema.path(name) instanceof mongoose.Schema.Types.Number;
}

/**
 * @returns {boolean} whether the field is a date field of the meber collection
 */
function isDateField () {
  return Member.schema.path(name) instanceof mongoose.Schema.Types.Date;
}

/**
 * Create an object that can be used in a $project to include the given fields.
 *
 * @param {Array} fields - array of field names to include in projection.
 * @param {Object} options - optional options. Set excludeId to false to exclude the _id field.
 * @returns {Object} list of fields to include
 */
function projectFields (fields, options) {
  var select = {};
  _.each(fields, function (field) {
    select[field] = getFieldName(field) === field ? 1 : '$' + getFieldName(field);
  });
  if (options && options.excludeId) {
    select._id = 0;
  }
  return select;
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
        filter[field] = rule;
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

function writeText (tds, res) {
  var now = moment.utc().format('YYYY-MM-DD');
  res.setHeader('Content-Disposition', 'attachment; filename="tds_' + now + '.txt"');
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  tds.forEach(function (member) {
    res.write(member.bboName + '\r\n');
  });
  res.end();
}

function csvEscape (val) {
  return val.replace(/"/g, '""');
}

function writeCsv (tds, res) {
  var now = moment.utc().format('YYYY-MM-DD');
  res.setHeader('Content-Disposition', 'attachment; filename="tds_' + now + '.csv"');
  res.setHeader('Content-Type', 'text/csv;charset=utf-8');

  if (tds.length > 0) {
    var sep = '';
    _.each(_.keys(tds[0]), function (field) {
      res.write(sep + '"' + field + '"');
      sep = ',';
    });
    res.write('\r\n');

    tds.forEach(function (member) {
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

function writeXml (tds, res) {
  var obj = {
    '?xml version=\"1.0\" encoding=\"UTF-8\"?': null,
    tds                                       : {td: tds}
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
    var sort = getSort(req, fields);
    var filter = getFindCriterias(req, {
      criteria: {'role': {$in: ['admin', 'blacklist manager', 'td manager', 'td']}}
    });
    Member.find(filter).count(function (err, count) {
          if (err) { console.error('tournamentDirectors.getAll', err); }
          var aggr = [];
          aggr.push({$match: filter});
          aggr.push({$project: projectFields(fields)});
          aggr.push({$sort: sort});
          aggr.push({$skip: skip});
          aggr.push({$limit: limit});
          Member.aggregate(aggr, function (err, tds) {
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
    var aggr = [];
    aggr.push({$match: {_id: req.params.id}});
    aggr.push({$project: projectFields(fields)});
    Member.aggregate(aggr, function (err, td) {
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
    var sort = getSort(req, fields);
    var filter = getFindCriterias(req, {
      criteria: {'role': {$in: ['admin', 'blacklist manager', 'td manager', 'td']}}
    });
    Member.find(filter).count(function (err) {
          if (err) { console.error('members.getAll', err); }
          var aggr = [];
          aggr.push({$match: filter});
          aggr.push({$project: projectFields(fields, {excludeId: true})});
          aggr.push({$sort: sort});
          Member.aggregate(aggr, function (err, tds) {
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
};
