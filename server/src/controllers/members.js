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
var fields = ['bboName', 'name', 'nation', 'email', 'telephone', 'level', 'role',
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
  'rockLastPlayedAt'  : 'rock.totalScores.lastPlayedAt',
  'rockNumTournaments': 'rock.totalScores.numTournaments',
  'rockAverageScore'  : 'rock.totalScores.averageScore',
  'rockAwards'        : 'rock.totalScores.awards',
  'rbdLastPlayedAt'   : 'rbd.totalScores.lastPlayedAt',
  'rbdNumTournaments' : 'rbd.totalScores.numTournaments',
  'rbdAverageScore'   : 'rbd.totalScores.averageScore',
  'rbdAwards'         : 'rbd.totalScores.awards'
};
var fieldDefinitions = require('../utils/fieldDefinitions')(Member, fields, field2FlatNames);
var listQueryParameters = require('../utils/listQueryParameters')(fieldDefinitions);
var exportToFile = require('../utils/exportToFile')('members', 'member', fieldDefinitions);

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
      return [{$or: [{validatedAt: {$exists: false}}, {validatedAt: {$type: 10}}]}];
    }

    return [{validatedAt: {$exists: true}}, {validatedAt: {$not: {$type: 10}}}];
  }
}

listQueryParameters.setCriteriaFunction('validatedAt', getValidatedAtCriteria);

module.exports = {

  index: function (req, res) {
    Member.find({}, function (err, data) {
      if (err) {
        console.error('members.index', err);
        return res.status(500).json({error: err});
      }

      res.json(data);
    });
  },

  getRock: function (req, res) {
    var limit = listQueryParameters.getLimit(req);
    var skip = listQueryParameters.getSkip(req);
    var sort = listQueryParameters.getSort(req,
        ['bboName', 'nation', 'level', 'awards', 'averageScore', 'numTournaments']);
    var filter = listQueryParameters.getFindCriteria(req, {
      criteria        : {
        isEnabled    : true,
        isBlackListed: false,
        isBanned     : false
      },
      doFilter        : false,
      restrictedSearch: true
    });
    Member.find(filter).count(function (err, count) {
      if (err) {
        console.error('members.getRock', err);
        return res.status(500).json({error: err});
      }

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
      criteria   : {
        isEnabled    : true,
        isBlackListed: false,
        isBanned     : false,
        isRbdPlayer  : true
      }, doFilter: false, restrictedSearch: true
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

  getAll: function (req, res) {
    var limit = listQueryParameters.getLimit(req);
    var skip = listQueryParameters.getSkip(req);
    var sort = listQueryParameters.getSort(req, fields);
    var filter = listQueryParameters.getFindCriteria(req);
    Member.find(filter).count(function (err, count) {
          if (err) {
            console.error('members.getAll', err);
            return res.status(500).json({error: err});
          }

          var aggr = [];
          aggr.push({$match: filter});
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
    var id = member._id;
    delete member._id;
    Member.findByIdAndUpdate(id, {$set: member}, function (err, updated) {
      if (err) {
        console.error('members.update', err);
        return res.status(500).json({error: err});
      }

      if (!updated) {
        return res.status(404).json({_id: 'Member not found'});
      }

      res.json(updated);
    });
  },

  changePassword: function (req, res) {
    var password = req.body;
    var id = password._id;
    delete password._id;
    Member.findById(id, function (err, member) {
      if (err) {
        console.error('members.changePassword', err);
        return res.status(500).json({error: err});
      }

      if (!member) {
        return res.status(404).json({_id: 'Member not found'});
      }

      if (!member.authenticate(password.currentPassword)) {
        return res.status(422).json({currentPassword: 'Incorrect password'});
      }

      if (password.newPassword !== password.repeatPassword) {
        return res.status(422).json({repeatPassword: "doesn't match"});
      }

      member.password = password.newPassword;
      member.save(function (err) {
        if (err) {
          console.error('members.changePassword', err);
          return res.status(500).json({error: 'Error changing password.'});
        }

        res.json(member);
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
