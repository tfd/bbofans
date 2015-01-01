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
var fieldDefinitions = require('../utils/fieldDefinitions')(Member, fields);
var listQueryParameters = require('../utils/listQueryParameters')(fieldDefinitions);
var exportToFile = require('../utils/exportToFile')('tds', 'td', fieldDefinitions);

module.exports = {

  getAll: function (req, res) {
    var limit = listQueryParameters.getLimit(req);
    var skip = listQueryParameters.getSkip(req);
    var sort = listQueryParameters.getSort(req, fields);
    var filter = listQueryParameters.getFindCriteria(req, {
      criteria: {'role': {$in: ['admin', 'blacklist manager', 'td manager', 'td']}}
    });
    Member.find(filter).count(function (err, count) {
          if (err) { console.error('tournamentDirectors.getAll', err); }
          var aggr = [];
          aggr.push({$match: filter});
          aggr.push({$project: fieldDefinitions.projectFields(fields)});
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
    aggr.push({$project: listQueryParameters.projectFields(fields)});
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
    var sort = listQueryParameters.getSort(req, fields);
    var filter = listQueryParameters.getFindCriteria(req, {
      criteria: {'role': {$in: ['admin', 'blacklist manager', 'td manager', 'td']}}
    });
    Member.find(filter).count(function (err) {
          if (err) { console.error('members.getAll', err); }
          var aggr = [];
          aggr.push({$match: filter});
          aggr.push({$project: fieldDefinitions.projectFields(fields, {excludeId: true})});
          aggr.push({$sort: sort});
          Member.aggregate(aggr, function (err, tds) {
                if (err) { console.error('tournamentDirectors.export', err); }

                var type = req.params.type ? req.params.type.toLowerCase() : 'text';
                exportToFile.export(type, tds, res);
              }
          );
        }
    );
  }
};
