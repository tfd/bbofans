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
 * @class FieldDefinitions
 *
 * @constructor
 * @param {Object} Model - model of the table
 * @param {String[]} fields - array of field names.
 * @param {Object} [field2FlatNames] - hash of field names to flat field names.
 */
module.exports = function FieldDefinitions(Model, fields, field2FlatNames) {
  field2FlatNames = field2FlatNames || {};

  return {
    /**
     * Return the name of the field.
     *
     * This can be a nested field name.
     *
     * @methodOf FieldDefinitions#
     * @param {String} field - the simple field name
     * @returns {String} the flat field name
     */
    getFieldFlatName: function (field) {
      return field2FlatNames[field] || field;
    },

    /**
     * @methodOf FieldDefinitions#
     * @param {string} name - name of the field
     * @returns {boolean} whether the given name is a valid field of the collection.
     */
    isValidFieldName: function (name) {
      return fields.indexOf(name) > -1;
    },

    /**
     * @methodOf FieldDefinitions#
     * @param {string} name - name of the field
     * @returns {boolean} whether the given name is an array field of the collection.
     */
    isArrayField: function (name) {
      return Model.schema.path(this.getFieldFlatName(name)) instanceof mongoose.Schema.Types.Array;
    },

    /**
     * @methodOf FieldDefinitions#
     * @param {string} name - name of the field
     * @returns {boolean} whether the given name is a boolean field of the collection.
     */
    isBooleanField: function (name) {
      return Model.schema.path(this.getFieldFlatName(name)) instanceof mongoose.Schema.Types.Boolean;
    },

    /**
     * @methodOf FieldDefinitions#
     * @param {string} name - name of the field
     * @returns {boolean} whether the given name is a numeric field of the collection.
     */
    isNumericField: function (name) {
      return Model.schema.path(this.getFieldFlatName(name)) instanceof mongoose.Schema.Types.Number;
    },

    /**
     * @methodOf FieldDefinitions#
     * @param {string} name - name of the field
     * @returns {boolean} whether the field is a date field of the collection
     */
    isDateField: function (name) {
      return Model.schema.path(this.getFieldFlatName(name)) instanceof mongoose.Schema.Types.Date;
    },

    /**
     * Create an object that can be used in a $project to include the given fields.
     *
     * @methodOf FieldDefinitions#
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

    /**
     * Get names of all the fields defined in the collection.
     *
     * @methodOf FieldDefinitions#
     * @returns {String[]} array of all fields in the collection
     */
    getFieldNames: function () {
      return fields;
    }

  };

};
