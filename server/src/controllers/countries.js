var mongoose = require('mongoose');
var fs = require('fs');

var countries;
fs.realpath('public/data/countries.json', function (err, path) {
  if (err) { console.log("Error reading countries.json", err); return; }
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) { console.log("Error reading countries.json", err); return; }
    countries = JSON.parse(data);
  });
});

module.exports = {
  
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
