/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var Member = mongoose.model('Member');
var moment = require('moment');
var _ = require('underscore');

/**
 * All field names in the table.
 *
 * @type {string[]}
 */
var fields = ['bboName', 'name', 'nation', 'emails', 'telephones', 'level', 'role',
              'isStarPlayer', 'isRbdPlayer', 'isEnabled', 'isBlackListed', 'isBanned',
              'rockLastPlayedAt', 'rockNumTournaments', 'rockAverageScore', 'rockAwards',
              'rbdLastPlayedAt', 'rbdNumTournaments', 'rbdAverageScore', 'rbdAwards',
              'skill', 'h3am', 'h7am', 'h11am', 'h3pm', 'h7pm', 'h11pm', 'info',
              'registeredAt', 'validatedAt'];
/**
 * Hashmap of field names to flat names.
 *
 * The bootstrap-table isn't able to interpret nested JSON objects so I use
 * $project to rename nested fields. This hashmap reconstructs the correct
 * nested name from the projected name.
 */
var field2FlatNames = {
  'rockLastPlayedAt'  : 'rock.lastPlayedAt',
  'rockNumTournaments': 'rock.totalScores.numTournaments',
  'rockAverageScore'  : 'rock.totalScores.averageScore',
  'rockAwards'        : 'rock.totalScores.awards',
  'rbdLastPlayedAt'   : 'rbd.lastPlayedAt',
  'rbdNumTournaments' : 'rbd.totalScores.numTournaments',
  'rbdAverageScore'   : 'rbd.totalScores.averageScore',
  'rbdAwards'         : 'rbd.totalScores.awards'
};
var fieldDefinitions = require('../utils/fieldDefinitions')(Member, fields, field2FlatNames);
var listQueryParameters = require('../utils/listQueryParameters')(fieldDefinitions);
var exportToFile = require('../utils/exportToFile')('members', 'member', fieldDefinitions);

function isValidUpdateKey(key) {
  return fields.indexOf(key) >= 0 && !field2FlatNames[key];
}

module.exports = function () {

  /**
   * Get the criteria for the validatedAt field.
   *
   * This criteria is an array of _values that can have only boolean values. True means that the member is to be
   * validated. false means that the member is has already been validated. When both true and false are set no condition
   * is returned.
   *
   * @param {String} field - the field name, always 'validatedAt.
   * @param {Object} criteria
   * @param {Boolean[]} criteria._values - array of boolean values,
   * @returns {Object[]} array with conditions to be met by the validatedAt field.
   */
  function getValidatedAtCriteria(field, criteria) {
    if (_.isArray(criteria._values)) {
      // this field needs special treatment!
      var toValidate = false;

      _.each(criteria._values, function (value) {
        if (value) {
          if (['true', 'yes', '1'].indexOf(value.toLowerCase()) >= 0) {
            toValidate = true;
          }
          else if (toValidate) {
            // Both true and false? Nothing to do.
            toValidate = null;
          }
        }
      });

      if (toValidate === null) {
        return [];
      }


      if (toValidate) {
        return [{registeredAt: {$exists: true}}, {registeredAt: {$not: {$type: 10}}},
                {$or: [{validatedAt: {$exists: false}}, {validatedAt: {$type: 10}}]}];
      }

      return [{validatedAt: {$exists: true}}, {validatedAt: {$not: {$type: 10}}}];
    }
  }

  listQueryParameters.setCriteriaFunction('validatedAt', getValidatedAtCriteria);

  /**
   * Get winners of a given month.
   *
   * @param {string} type - type of tournament. One of rock or rbd.
   * @param {number} month - month of year, starting with 0 for january
   * @param {number} year - year
   * @param {string} field - field to use for sorting. One of averageScore or awards.
   * @param {function} cb - function called with the result
   */
  function getWinners(type, month, year, field, cb) {
    var sortField = type + '.monthlyScores.' + field;
    var sort = {};
    sort[sortField] = -1;

    var match = {};
    match[type + '.monthlyScores.month'] = month;
    match[type + '.monthlyScores.year'] = year;

    var aggr = [];
    aggr.push({$unwind: '$' + type + '.monthlyScores'});
    aggr.push({$match: match});
    aggr.push({$sort: sort});
    aggr.push({
      $project: {
        _id         : 0,
        bboName     : 1,
        averageScore: '$' + type + '.monthlyScores.averageScore',
        awards      : '$' + type + '.monthlyScores.awards'
      }
    });
    aggr.push({$limit: 10});
    Member.aggregate(aggr, cb);
  }

  return {

    getRock: function (req, res) {
      var limit = listQueryParameters.getLimit(req);
      var skip = listQueryParameters.getSkip(req);
      var sort = listQueryParameters.getSort(req,
          ['bboName', 'nation', 'level', 'awards', 'averageScore', 'numTournaments']);
      var filter = listQueryParameters.getFindCriteria(req, {
        criteria: {
          isEnabled    : true,
          isBlackListed: false,
          isBanned     : false
        },
        doFilter: false
      });
      Member.find(filter).count(function (err, count) {
        if (err) {
          console.error('members.getRock', err);
          return res.status(500).json({error: err});
        }

        console.log('sort', sort);

        var aggr = [];
        aggr.push({$match: filter});
        aggr.push({
          $project: fieldDefinitions.projectFields([
            'bboName', 'nation', 'level', 'rockAwards', 'rockAverageScore', 'rockNumTournaments'
          ])
        });
        aggr.push({$sort: sort});
        aggr.push({$skip: skip});
        aggr.push({$limit: limit});
        Member.aggregate(aggr, function (err, data) {
          if (err) {
            console.error('members.getRock', err);
            return res.status(500).json({error: err});
          }

          res.json({
            skip : skip,
            limit: limit,
            sort : sort,
            total: count,
            rows : data
          });
        });
      });
    },

    getRbd: function (req, res) {
      var limit = listQueryParameters.getLimit(req);
      var skip = listQueryParameters.getSkip(req);
      var sort = listQueryParameters.getSort(req,
          ['bboName', 'nation', 'level', 'awards', 'averageScore', 'numTournaments']);
      var filter = listQueryParameters.getFindCriteria(req, {
        criteria: {
          isEnabled    : true,
          isBlackListed: false,
          isBanned     : false,
          isRbdPlayer  : true
        },
        doFilter: false
      });
      Member.find(filter).count(function (err, count) {
        if (err) {
          console.error('members.getRbd', err);
          return res.status(500).json({error: err});
        }

        var aggr = [];
        aggr.push({$match: filter});
        aggr.push({
          $project: fieldDefinitions.projectFields([
            'bboName', 'nation', 'level', 'rbdAwards', 'rbdAverageScore', 'rbdNumTournaments'
          ])
        });
        aggr.push({$sort: sort});
        aggr.push({$skip: skip});
        aggr.push({$limit: limit});
        Member.aggregate(aggr, function (err, data) {
          if (err) {
            console.error('members.getRbd', err);
            return res.status(500).json({error: err});
          }

          res.json({
            skip : skip,
            limit: limit,
            sort : sort,
            total: count,
            rows : data
          });
        });
      });
    },

    getRockWinners: function (req, res) {
      var month = req.query.month ? parseInt(req.query.month, 10) : moment().month();
      var year = req.query.year ? parseInt(req.query.year, 10) : moment().year();
      var sortField = (req.query.score && req.query.score !== 'no' ? 'averageScore' : 'awards');
      getWinners('rock', month, year, sortField, function (err, result) {
        if (err) {
          console.error('members.getRockWinners', err);
          return res.status(500).json({error: err});
        }

        res.json(result);
      });
    },

    getRbdWinners: function (req, res) {
      var month = req.query.month ? parseInt(req.query.month, 10) : moment().month();
      var year = req.query.year ? parseInt(req.query.year, 10) : moment().year();
      var sortField = (req.query.score && req.query.score !== 'no' ? 'averageScore' : 'awards');
      getWinners('rbd', month, year, sortField, function (err, result) {
        if (err) {
          console.error('members.getRockWinners', err);
          return res.status(500).json({error: err});
        }

        res.json(result);
      });
    },

    getAll: function (req, res) {
      var limit = listQueryParameters.getLimit(req);
      var skip = listQueryParameters.getSkip(req);
      var sort = listQueryParameters.getSort(req, fields);
      var filter = listQueryParameters.getFindCriteria(req, {
        searchFields: ['bboName', 'emails', 'name']
      });
      Member.find(filter).count(function (err, count) {
            if (err) {
              console.error('members.getAll', err);
              return res.status(500).json({error: err});
            }

            // Project email and telephone instead of arrays emails and telephones.
            var project = fieldDefinitions.projectFields(fields);
            project.email = 1;
            project.emails = 0;
            project.telephone = 1;
            project.telephones = 0;

            var aggr = [];
            aggr.push({$match: filter});

            // Get first email
            aggr.push({
              $project: {
                _id      : {
                  _id            : '$_id',
                  bboName        : '$bboName',
                  name           : '$name',
                  nation         : '$nation',
                  telephones     : '$telephones',
                  level          : '$level',
                  hashed_password: '$hashed_password',
                  salt           : '$salt',
                  role           : '$role',
                  isStarPlayer   : '$isStarPlayer',
                  isRbdPlayer    : '$isRbdPlayer',
                  isEnabled      : '$isEnabled',
                  isBlackListed  : '$isBlackListed',
                  isBanned       : '$isBanned',
                  notes          : '$notes',
                  skill          : '$skill',
                  h3am           : '$h3am',
                  h7am           : '$h7am',
                  h11am          : '$h11am',
                  h3pm           : '$h3pm',
                  h7pm           : '$h7pm',
                  h11pm          : '$h11pm',
                  info           : '$info',
                  rock           : '$rock',
                  rbd            : '$rbd',
                  registeredAt   : '$registeredAt',
                  validatedAt    : '$validatedAt'
                }, emails: {$cond: [{$eq: ['$emails', []]}, [''], '$emails']}
              }
            });
            aggr.push({$unwind: '$emails'});
            aggr.push({$group: {_id: '$_id', email: {$first: '$emails'}}});
            aggr.push({
              $project: {
                _id            : '$_id._id',
                bboName        : '$_id.bboName',
                name           : '$_id.name',
                nation         : '$_id.nation',
                emails         : '$email',
                telephones     : '$_id.telephones',
                level          : '$_id.level',
                hashed_password: '$_id.hashed_password',
                salt           : '$_id.salt',
                role           : '$_id.role',
                isStarPlayer   : '$_id.isStarPlayer',
                isRbdPlayer    : '$_id.isRbdPlayer',
                isEnabled      : '$_id.isEnabled',
                isBlackListed  : '$_id.isBlackListed',
                isBanned       : '$_id.isBanned',
                notes          : '$_id.notes',
                skill          : '$_id.skill',
                h3am           : '$_id.h3am',
                h7am           : '$_id.h7am',
                h11am          : '$_id.h11am',
                h3pm           : '$_id.h3pm',
                h7pm           : '$_id.h7pm',
                h11pm          : '$_id.h11pm',
                info           : '$_id.info',
                rock           : '$_id.rock',
                rbd            : '$_id.rbd',
                registeredAt   : '$_id.registeredAt',
                validatedAt    : '$_id.validatedAt'
              }
            });

            // Get first telephone
            aggr.push({
              $project: {
                _id          : {
                  _id            : '$_id',
                  bboName        : '$bboName',
                  name           : '$name',
                  nation         : '$nation',
                  emails         : '$emails',
                  level          : '$level',
                  hashed_password: '$hashed_password',
                  salt           : '$salt',
                  role           : '$role',
                  isStarPlayer   : '$isStarPlayer',
                  isRbdPlayer    : '$isRbdPlayer',
                  isEnabled      : '$isEnabled',
                  isBlackListed  : '$isBlackListed',
                  isBanned       : '$isBanned',
                  notes          : '$notes',
                  skill          : '$skill',
                  h3am           : '$h3am',
                  h7am           : '$h7am',
                  h11am          : '$h11am',
                  h3pm           : '$h3pm',
                  h7pm           : '$h7pm',
                  h11pm          : '$h11pm',
                  info           : '$info',
                  rock           : '$rock',
                  rbd            : '$rbd',
                  registeredAt   : '$registeredAt',
                  validatedAt    : '$validatedAt'
                }, telephones: {$cond: [{$eq: ['$telephones', []]}, [''], '$telephones']}
              }
            });
            aggr.push({$unwind: '$telephones'});
            aggr.push({$group: {_id: '$_id', telephone: {$first: '$telephones'}}});
            aggr.push({
              $project: {
                _id            : '$_id._id',
                bboName        : '$_id.bboName',
                name           : '$_id.name',
                nation         : '$_id.nation',
                emails         : '$_id.emails',
                telephones     : '$telephone',
                level          : '$_id.level',
                hashed_password: '$_id.hashed_password',
                salt           : '$_id.salt',
                role           : '$_id.role',
                isStarPlayer   : '$_id.isStarPlayer',
                isRbdPlayer    : '$_id.isRbdPlayer',
                isEnabled      : '$_id.isEnabled',
                isBlackListed  : '$_id.isBlackListed',
                isBanned       : '$_id.isBanned',
                notes          : '$_id.notes',
                skill          : '$_id.skill',
                h3am           : '$_id.h3am',
                h7am           : '$_id.h7am',
                h11am          : '$_id.h11am',
                h3pm           : '$_id.h3pm',
                h7pm           : '$_id.h7pm',
                h11pm          : '$_id.h11pm',
                info           : '$_id.info',
                rock           : '$_id.rock',
                rbd            : '$_id.rbd',
                registeredAt   : '$_id.registeredAt',
                validatedAt    : '$_id.validatedAt'
              }
            });

            aggr.push({$project: fieldDefinitions.projectFields(fields)});
            aggr.push({$sort: sort});
            aggr.push({$skip: skip});
            aggr.push({$limit: limit});
            Member.aggregate(aggr, function (err, data) {
                  if (err) {
                    console.error('members.getAll', err);
                    return res.status(500).json({error: err});
                  }

                  res.json({
                    skip : skip,
                    limit: limit,
                    sort : sort,
                    total: count,
                    rows : data
                  });
                }
            );
          }
      );
    },

    getBboNames: function (req, res) {
      var q = req.query.q || '';
      Member.find({bboName: {$regex: new RegExp(q, 'i')}})
          .select('bboName -_id')
          .exec(function (err, data) {
            if (err) {
              console.error('members.getBboName', err);
              return res.status(500).json({error: err});
            }

            if (req.query.bloodhound) {
              res.json(data);
            }
            else {
              var arr = [];
              _.each(data, function (member) {
                arr.push(member.bboName);
              });
              res.json(arr);
            }
          });
    },

    getById: function (req, res) {
      Member.findById(req.params.id, function (err, player) {
        if (err) {
          console.error('members.getById', err);
          return res.status(500).json({error: err});
        }

        if (player === null) {
          res.status(404).json({error: 'Member not found.'});
        }
        else {
          res.json(player);
        }
      });
    },

    add: function (req, res) {
      if (req.body._id) {
        // Existing member, update!
        this.update(req, res);
      }
      else {
        if (req.body.bboName) {
          req.body.bboName = req.body.bboName.toLowerCase();
        }

        // New member, save it.
        var memberToSave = new Member(req.body);
        memberToSave.save(function (err, member) {
          if (err) {
            var error = err.err.toString();
            if (error.indexOf('E11000 duplicate key error') === 0) {
              var fieldName = error.match(/members\.\$(.*)_\d/i)[1];
              var fieldValue = error.match(/dup\skey:\s\{\s:\s"(.*)"\s\}/)[1];
              var errors = {};
              errors[fieldName] = 'Value "' + fieldValue + '" already present in database';
              res.status(409).json(errors);
            }
            else {
              console.error('members.add', err);
              res.status(422).json({bboName: error});
            }
          }
          else {
            res.json(member);
          }
        });
      }
    },

    update: function (req, res) {
      var member = req.body;
      if (member.bboName) {
        member.bboName = member.bboName.toLowerCase();
      }

      var id = member._id;
      delete member._id;
      Member.findById(id, function (err, originalMember) {
        if (err) {
          console.error('members.update', err);
          return res.status(500).json({error: err});
        }

        if (!originalMember) {
          return res.status(404).json({_id: 'Member not found'});
        }

        _.each(member, function (value, key) {
          if (isValidUpdateKey(key)) {
            originalMember[key] = value;
          }
        });

        originalMember.save(function (err, updated) {
          if (err) {
            console.error('members.update', err);
            return res.status(500).json({error: err});
          }

          if (!updated) {
            return res.status(404).json({_id: 'Member not found'});
          }

          res.json(updated);
        });
      });
    },

    remove: function (req, res) {
      Member.findOne({_id: req.params.id}, function (err, member) {
        if (err) {
          console.error('members.remove', err);
          return res.status(500).json({error: err});
        }

        if (!member) {
          return res.status(404).json({_id: 'Member not found'});
        }

        member.remove(function (err) {
          if (err) {
            console.error('members.remove', err);
            return res.status(500).json({error: err});
          }

          res.json({status: 'Success'});
        });
      });
    },

    saveAs: function (req, res) {
      var sort = listQueryParameters.getSort(req, fields);
      var filter = listQueryParameters.getFindCriteria(req);
      Member.find(filter, function (err) {
            if (err) {
              console.error('members.getAll', err);
              return res.status(500).json({error: err});
            }

            var aggr = [];
            aggr.push({$match: filter});
            aggr.push({$project: fieldDefinitions.projectFields(fields, {excludeId: true})});
            aggr.push({$sort: sort});
            Member.aggregate(aggr, function (err, members) {
                  if (err) {
                    console.error('members.saveAs', err);
                    return res.status(500).json({error: err});
                  }

                  var type = req.params.type ? req.params.type.toLowerCase() : 'txt';
                  exportToFile.saveAs(type, members, res);
                }
            );
          }
      );
    }

  };
};
