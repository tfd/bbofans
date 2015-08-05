/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var moment = require('moment');
var _ = require('underscore');
var fields = ['bboName',
              'name',
              'emails',
              'telephones',
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
var logger = require('../utils/logger');

module.exports = function () {
  return {

    getAll: function (req, res) {
      var limit = listQueryParameters.getLimit(req);
      var skip = listQueryParameters.getSkip(req);
      var sort = listQueryParameters.getSort(req, fields);
      var filter = listQueryParameters.getFindCriteria(req, {
        criteria: {'role': {$in: ['admin', 'blacklist manager', 'td manager', 'td']}}
      });
      Member.find(filter).count(function (err, count) {
            if (err) {
              logger.error('tournamentDirectors.getAll', err);
              return res.status(500).json({error: err});
            }

            var aggr = [];
            aggr.push({$match: filter});

            // Get first email
            aggr.push({
              $project: {
                _id      : {
                  _id       : '$_id',
                  bboName   : '$bboName',
                  name      : '$name',
                  nation    : '$nation',
                  telephones: '$telephones',
                  skill     : '$skill',
                  h3am      : '$h3am',
                  h7am      : '$h7am',
                  h11am     : '$h11am',
                  h3pm      : '$h3pm',
                  h7pm      : '$h7pm',
                  h11pm     : '$h11pm',
                  info      : '$info'
                }, emails: {$cond: [{$eq: ['$emails', []]}, [''], '$emails']}
              }
            });
            aggr.push({$unwind: '$emails'});
            aggr.push({$group: {_id: '$_id', email: {$first: '$emails'}}});
            aggr.push({
              $project: {
                _id       : '$_id._id',
                bboName   : '$_id.bboName',
                name      : '$_id.name',
                nation    : '$_id.nation',
                emails    : '$email',
                telephones: '$_id.telephones',
                skill     : '$_id.skill',
                h3am      : '$_id.h3am',
                h7am      : '$_id.h7am',
                h11am     : '$_id.h11am',
                h3pm      : '$_id.h3pm',
                h7pm      : '$_id.h7pm',
                h11pm     : '$_id.h11pm',
                info      : '$_id.info'
              }
            });

            // Get first telephone
            aggr.push({
              $project: {
                _id          : {
                  _id    : '$_id',
                  bboName: '$bboName',
                  name   : '$name',
                  nation : '$nation',
                  emails : '$emails',
                  skill  : '$skill',
                  h3am   : '$h3am',
                  h7am   : '$h7am',
                  h11am  : '$h11am',
                  h3pm   : '$h3pm',
                  h7pm   : '$h7pm',
                  h11pm  : '$h11pm',
                  info   : '$info'
                }, telephones: {$cond: [{$eq: ['$telephones', []]}, [''], '$telephones']}
              }
            });
            aggr.push({$unwind: '$telephones'});
            aggr.push({$group: {_id: '$_id', telephone: {$first: '$telephones'}}});
            aggr.push({
              $project: {
                _id       : '$_id._id',
                bboName   : '$_id.bboName',
                name      : '$_id.name',
                nation    : '$_id.nation',
                emails    : '$_id.emails',
                telephones: '$telephone',
                skill     : '$_id.skill',
                h3am      : '$_id.h3am',
                h7am      : '$_id.h7am',
                h11am     : '$_id.h11am',
                h3pm      : '$_id.h3pm',
                h7pm      : '$_id.h7pm',
                h11pm     : '$_id.h11pm',
                info      : '$_id.info'
              }
            });

            aggr.push({$project: fieldDefinitions.projectFields(fields)});
            aggr.push({$sort: sort});
            aggr.push({$skip: skip});
            aggr.push({$limit: limit});
            Member.aggregate(aggr, function (err, tds) {
              if (err) {
                logger.error('tournamentDirectors.getAll', err);
                return res.status(500).json({error: err});
              }

              res.json({
                skip : skip,
                limit: limit,
                sort : sort,
                total: count,
                rows : tds
              });
            });
          }
      );
    },

    getById: function (req, res) {
      var aggr = [];
      aggr.push({$match: {_id: req.params.id}});
      Member.aggregate(aggr, function (err, td) {
        if (err) {
          if (err) { logger.error('tournamentDirectors.getById', err); }
          return res.status(500).json({error: err});
        }

        if (td === null) {
          return res.status(404).json({_id: 'TD not found.'});
        }

        res.json(td);
      });
    },

    update: function (req, res) {
      var id = req.body._id;
      delete req.body._id;
      Member.findByIdAndUpdate(id, {$set: req.body}, function (err, updated) {
        if (err) {
          logger.error('tournamentDirectors.update', err);
          return res.status(500).json({error: err});
        }

        if (updated === null) {
          return res.status(404).json({_id: 'TD not found.'});
        }

        res.json(updated);
      });
    },

    saveAs: function (req, res) {
      var sort = listQueryParameters.getSort(req, fields);
      var filter = listQueryParameters.getFindCriteria(req, {
        criteria: {'role': {$in: ['admin', 'blacklist manager', 'td manager', 'td']}}
      });
      Member.find(filter, function (err) {
            if (err) {
              logger.error('tournamentDirectors.saveAs', err);
              return res.status(500).json({error: err});
            }

            var aggr = [];
            aggr.push({$match: filter});
            aggr.push({$project: fieldDefinitions.projectFields(fields, {excludeId: true})});
            aggr.push({$sort: sort});
            Member.aggregate(aggr, function (err, tds) {
                  if (err) {
                    logger.error('tournamentDirectors.saveAs', err);
                    return res.status(500).json({error: err});
                  }

                  var type = req.params.type ? req.params.type.toLowerCase() : 'text';
                  exportToFile.saveAs(type, tds, res);
                }
            );
          }
      );
    },

    getBboNames: function (req, res) {
      Member
          .find({'role': {$in: ['admin', 'blacklist manager', 'td manager', 'td']}},
          {'bboName': 1, '_id': 0})
          .sort({'bboName': 1})
          .exec(function (err, tds) {
            if (err) {
              logger.error('tournamentDirectors.getBboNames', err);
              return res.status(500).json({error: err});
            }

            var arr = [];
            _.each(tds, function (td) {
              arr.push(td.bboName);
            });
            res.json(arr);
          }
      );
    }
  };
};
