/**
 * Utilities to parse the query parameters for list parameters limit, skip, sort, search, and filter.
 *
 * @module listQueryParameters
 */

/**
 * @constructor
 * @class ListQueryParameters
 *
 * @param {FieldDefinitions} fieldDefinitions - definitions of fields that make up the table
 * @returns {ListQueryParameters} the ListQueryParameters object ofr the given fieldDefinitions
 */
module.exports = function (fieldDefinitions) {

  /**
   * @param {String} field - name of field, used to determine the variable type
   * @param {String} value - value to sanitize
   * @returns {String|Number|Boolean} sanitized value: only alphanumeric and spaces are allowed.
   *          Any other character is replaced with a dot so it works in a regexp.
   */
  function sanitize (field, val) {
    if (fieldDefinitions.isNumericField(field)) {
      return parseFloat(val);
    }
    if (fieldDefinitions.isBooleanField(val)) {
      if (['yes', 'true', '1'].indexOf(val.toLowerCase()) >= 0) {
        return true;
      }
      return false;
    }
    val = val.replace(/[^a-zA-Z0-9_\s]/, ".").replace(/\s/, " ");
    return val;
  }

  /**
   * Get a single criteria rule.
   *
   * Constructs a mongo db filter rule for the given criteria.
   *
   * @param {String} field - name of the field
   * @param {String} criteria - a criteria
   * @param {String} value - value to check against
   * @returns {Object} the criteria rule.
   */
  function getRule (field, criteria, value) {
    var values = [];
    var i = 0;

    switch (criteria) {
      case 'lte':
        return {$lt: sanitize(field, value)};

      case 'gte':
        return {$gt: sanitize(field, value)};

      case 'eq':
        return fieldDefinitions.isNumericField(field) ? {$eq: sanitize(field, value)} :
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
          filter[fieldDefinitions.getFieldName(field)] = rule;
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
   * _values: list of accepted values. The values "ept" and "nept" have the special meaning
   *          "empty" and "not empty".
   *
   * Boolean values are written as strings "false" and "true". Obviously a boolean criteria
   * of { _values: ['true', 'false'] } is legal but doesn't make sense and is eliminated from
   * the resulting filter.
   *
   * @param {Object} req - query request
   * @param {Object} options
   * @param {Boolean} options.doFilter - whether to include the filter field in the criteria
   * @returns {Array} an array of criteria to be applied in $and.
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
      if (filter.hasOwnProperty(key) && fieldDefinitions.isValidFieldName(key)) {
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
   * @param {Object} options
   * @param {Boolean} options.doSearch - whether to include the search field in the criteria
   * @returns {Array} array of criteria to be applied in $and.
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

  return {
    /**
     * Read offset from the query parameters.
     *
     * @param {Object} req - query request
     * @returns {Number} The integer value of the offset query parameter if present, 0 otherwise.
     */
    getSkip: function (req) {
      var skip = 0;
      if (req.query.offset) {
        skip = parseInt(req.query.offset, 10);
        if (isNaN(skip) || skip < 0) {
          skip = 0;
        }
      }
      return skip;
    },

    /**
     * Read limit from the query parameters.
     *
     * @param {Object} req - query request
     * @returns {number} integer value of the limit query parameter if present, 10 otherwise.
     */
    getLimit: function (req) {
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
    },

    /**
     * Read sort and order from the query parameters.
     *
     * @param {Object} req - query request
     * @param {Array} fields - array of fields on which the user may sort..
     * @returns {Object} An object with the sort field name as key and 1 or -1 as value.
     */
    getSort: function (req, fields) {
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
    },

    /**
     * Read filter and search from the query parameters.
     *
     * @param {Object} req - the http request.
     * @param {Object} [options] - options to control the criteria included
     * @param {Object} [options.criteria] - initial criteria to include
     * @param {Boolean} [options.doSearch] - whether to include the search field in the criteria
     * @param {Boolean} [options.doFilter] - whether to include the filter field in the criteria
     * @returns {Object} an object that can be passed to mongo db find().
     */
    getFindCriteria: function (req, options) {
      options = options || {};
      var criteria = initializeCriteria(options.criteria);

      // Handle 'filter' query parameter
      criteria = criteria.concat(getFilterCriteria(req, options));

      // Handle 'search' query parameter
      criteria = criteria.concat(getSearchCriteria(req, options));

      return criteria.length > 0 ? (criteria.length === 1 ? criteria[0] : {$and: criteria}) : {};
    }

  };
};
