/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var fileUtils = require('../utils/fileUtils');

module.exports = function (config) {

  var countries = require('../../data/countries');

  return {
    get: function (req, res) {
      var q = req.query.q || '';
      q = q.toLowerCase();
      var found = [];
      countries.forEach(function (country) {
        if (q.length === 0 || country.toLowerCase().indexOf(q) >= 0) { found.push(country); }
      });
      res.json(found);
    }
  };
};
