/* jshint -W097 */
"use strict";

/**
 * Manage table field definitions.
 *
 * @module fieldDefinitions
 */

var mongoose = require('mongoose');
var _ = require('underscore');

/**
 * @constructor
 * @class FieldDefinitions
 *
 * @param {Object} Model - model of the table
 * @param {String[]} fields - array of field names.
 * @param {Object} [field2FlatNames] - hash of field names to full field names.
 * @returns {FieldDefinitions} a FieldDefinitions object for the given fields.
 */
module.exports = function (Model, fields, field2FlatNames) {
  field2FlatNames = field2FlatNames || {};

  return {
    /**
     * Return the name of the field.
     *
     * This can be a nested field name.
     *
     * @name FieldDefinitions#getFieldFlatName
     * @param {String} field - the simple field name
     * @returns {String} the real field name
     */
    getFieldFlatName: function (field) {
      return field2FlatNames[field] || field;
    },

    /**
     * @name FieldDefinitions#isValidFieldName
     * @returns {boolean} whether the given name is a valid field of the member collection.
     */
    isValidFieldName: function (name) {
      return fields.indexOf(name) > -1;
    },

    /**
     * @name FieldDefinitions#isBooleanField
     * @returns {boolean} whether the given name is a boolean field of the member collection.
     */
    isBooleanField: function (name) {
      return Model.schema.path(this.getFieldFlatName(name)) instanceof mongoose.Schema.Types.Boolean;
    },

    /**
     * @name FieldDefinitions#isNumericField
     * @returns {boolean} whether the given name is a numeric field of the member collection.
     */
    isNumericField: function (name) {
      return Model.schema.path(this.getFieldFlatName(name)) instanceof mongoose.Schema.Types.Number;
    },

    /**
     * @name FieldDefinitions#isDateField
     * @returns {boolean} whether the field is a date field of the meber collection
     */
    isDateField: function (name) {
      return Model.schema.path(this.getFieldFlatName(name)) instanceof mongoose.Schema.Types.Date;
    },

    /**
     * Create an object that can be used in a $project to include the given fields.
     *
     * @name FieldDefinitions#projectFields
     * @param {Array} fields - array of field names to include in projection.
     * @param {Object} [options] - options
     * @param {Boolean} options.excludeId - set to true to exclude the _id field from the projection
     * @returns {Object} list of fields to include
     */
    projectFields: function (fields, options) {
      var self = this;
      var select = {};
      _.each(fields, function (field) {
        select[field] = self.getFieldFlatName(field) === field ? 1 : '$' + self.getFieldFlatName(field);
      });
      if (options && options.excludeId) {
        select._id = 0;
      }
      return select;
    },

    getFieldNames: function () {
      return fields;
    }

  };

};
