/**
 * Export collection to various formats.
 *
 * @module export
 */

var moment = require('moment');
var o2x = require('object-to-xml');
var _ = require('underscore');

/**
 * @class ExportToFile
 * @constructor
 *
 * @param {String} collectionName - name of the collection
 * @param {String} itemName - name of a single item of the collection
 * @param {FieldDefinition} fieldDefinitions - definitions of field in the collection
 * @returns {ExportToFile} a Export object for the given collection
 */
module.exports = function (collectionName, itemName, fieldDefinitions) {

  var writeTxtDoc = function (doc, res) {
    res.write(doc.bboName);
  };

  function writeText (collection, res) {
    var now = moment.utc().format('YYYY-MM-DD');
    res.setHeader('Content-Disposition', 'attachment; filename="' + collectionName + '_' + now + '.txt"');
    res.setHeader('Content-Type', 'text/plain;charset=utf-8');
    collection.forEach(function (doc) {
      writeTxtDoc(doc,res);
      res.write('\r\n');
    });
    res.end();
  }

  function csvEscape (val) {
    return val.replace(/"/g, '""');
  }

  var writeCsvHeader = function (fields, res) {
    var sep = '';
    _.each(fields, function (field) {
      res.write(sep + '"' + csvEscape(field) + '"');
      sep = ',';
    });
  };

  var writeCsvDoc = function (doc, res) {
    var sep = '';
    _.each(doc, function (val, field) {
      console.log(field, val);
      res.write(sep);
      if (fieldDefinitions.isBooleanField(field)) {
        res.write((val ? 'Y' : 'N'));
      }
      else if (fieldDefinitions.isNumericField(field)) {
        res.write(val.toFixed(2).toString());
      }
      else if (fieldDefinitions.isDateField(field)) {
        res.write(moment(val).utc().format());
      }
      else {
        res.write('"' + csvEscape(val) + '"');
      }

      sep = ',';
    });
  };

  function writeCsv (collection, res) {
    var now = moment.utc().format('YYYY-MM-DD');
    res.setHeader('Content-Disposition', 'attachment; filename="' + collectionName + '_' + now + '.csv"');
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');

    if (collection.length > 0) {
      writeCsvHeader(_.keys(collection[0]), res);
      res.write('\r\n');

      collection.forEach(function (doc) {
        writeCsvDoc(doc, res);
        res.write('\r\n');
      });
    }
    res.end();
  }

  var prepareCollectionForXml = function (collection) {
    return collection;
  };

  function writeXml (collection, res) {
    var obj = { '?xml version=\"1.0\" encoding=\"UTF-8\"?': null };
    obj[collectionName] = {};
    obj[collectionName][itemName] = prepareCollectionForXml(collection);

    var now = moment.utc().format('YYYY-MM-DD');
    res.setHeader('Content-Disposition', 'attachment; filename="' + collectionName + '_' + now + '.xml"');
    res.setHeader('Content-Type', 'application/xml;charset=utf-8');
    res.write(o2x(obj));
    res.end();
  }

  function writeJson(collection, res) {
    var now = moment.utc().format('YYYY-MM-DD');
    var obj = {};
    obj[collectionName] = collection;
    res.setHeader('Content-Disposition', 'attachment; filename="' + collectionName + '_' + now + '.json"');
    res.json(obj);
  }

  return {
    /**
     * Export a collection to a file.
     *
     * @param {String} type - type of file to create. One of json, xml, csv, or txt
     * @param {Array} collection - array of items to saveAs.
     * @param {Object} res - http response object to write the file to.
     */
    saveAs: function (type, collection, res) {
      switch (type) {
        case 'json':
          writeJson(collection, res);
          break;

        case 'xml' :
          writeXml(collection, res);
          break;

        case 'csv' :
          writeCsv(collection, res);
          break;

        default:
          writeText(collection, res);
          break;
      }
    },

    csvEscape: csvEscape,

    /**
     * Write CSV header.
     *
     * The function must NOT write the line terminator.
     *
     * @callback ExportToFile~writeCsvHeader
     * @param {String[]} fields - field names
     * @param {Object} res - http response object
     */

    /**
     * Set the function used to write the CSV header.
     *
     * The default function simple writes the field names.
     *
     * @param {ExportToFile~writeCsvHeader} fn - function called to write the CSV header
     */
    setCsvHeaderWriter: function (fn) {
      if (_.isFunction(fn)) {
        writeCsvHeader = fn;
      }
    },

    /**
     * Write a single document to the CSV file.
     *
     * The function must NOT write the line terminator.
     *
     * @callback ExportToFile~writeCsvDoc
     * @param {Object} doc - the document
     * @param {Object} res - http response object
     */

    /**
     * Set the function used to write a single document in CSV format.
     *
     * The default function simply writes all the values in order, and won't work with nested documents.
     *
     * @param {ExportToFile~writeCsvDoc} fn - function called to write a document to the CSV file
     */
    setCsvDocWriter: function (fn) {
      if (_.isFunction(fn)) {
        writeCsvDoc = fn;
      }
    },

    /**
     * Prepare the collection for XML output.
     *
     * @callback ExportToFile~prepareCollectionForXml
     * @param {Object} collection - the collection
     * @returns {Object} the prepared collection
     */

    /**
     * Prepare the collection for XML output.
     *
     * XML output sometimes needs some extra object names to get a prettier output.
     *
     * @param {ExportToFile~prepareCollectionForXml} fn - function called before doing the XML output.
     */
    setXmlCollectionPreparer: function (fn) {
      if (_.isFunction(fn)) {
        prepareCollectionForXml = fn;
      }
    },

    /**
     * Write a single document to the text file.
     *
     * The function must NOT write the line terminator.
     *
     * @callback ExportToFile~writeTxtDoc
     * @param {Object} doc - the document
     * @param {Object} res - http response object
     */

    /**
     * Set the function used to write a single document in text format.
     *
     * The default function simply writes the bboName.
     *
     * @param {ExportToFile~writeTxtDoc} fn - function called to write a document to the text file
     */
    setTxtDocWriter: function (fn) {
      if (_.isFunction(fn)) {
        writeTxtDoc = fn;
      }
    }
  };
};
