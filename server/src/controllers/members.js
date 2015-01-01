var mongoose = require('mongoose');
var recaptcha = require('../controllers/recaptcha');
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
  'rbdAwards'         : 'rbd.totalScores.awards',
};
var fieldDefinitions = require('../utils/fieldDefinitions')(Member, fields, field2FlatNames);
var listQueryParameters = require('../utils/listQueryParameters')(fieldDefinitions);
var exportToFile = require('../utils/exportToFile')('members', 'member', fieldDefinitions);

module.exports = {

  index: function (req, res) {
    Member.find({}, function (err, data) {
      if (err) { console.error('members.index', err); }
      res.json(data);
    });
  },

  getRock: function (req, res) {
    var limit = listQueryParameters.getLimit(req);
    var skip = listQueryParameters.getSkip(req);
    var sort = listQueryParameters.getSort(req, ['bboName', 'nation', 'level', 'awards', 'averageScore', 'numTournaments']);
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
      if (err) { console.error('members.getRock', err); }
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
        if (err) { console.error('members.getRock', err); }
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
    var sort = listQueryParameters.getSort(req, ['bboName', 'nation', 'level', 'awards', 'averageScore', 'numTournaments']);
    var filter = listQueryParameters.getFindCriteria(req, {
      criteria   : {
        isEnabled    : true,
        isBlackListed: false,
        isBanned     : false,
        isRbdPlayer  : true
      }, doFilter: false, restrictedSearch: true
    });
    Member.find(filter).count(function (err, count) {
      if (err) { console.error('members.getRbd', err); }
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
        if (err) { console.error('members.getRbd', err); }
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
          if (err) { console.error('members.getAll', err); }
          var aggr = [];
          aggr.push({$match: filter});
          aggr.push({$project: fieldDefinitions.projectFields(fields)});
          aggr.push({$sort: sort});
          aggr.push({$skip: skip});
          aggr.push({$limit: limit});
          Member.aggregate(aggr, function (err, data) {
                if (err) { console.error('members.getAll', err); }
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
        .select('bboName')
        .exec(function (err, data) {
          if (err) { console.error('members.getBboName', err); }
          res.json(data);
        });
  },

  getById: function (req, res) {
    Member.findById(req.params.id, function (err, player) {
      if (err) {
        if (err) { console.error('members.getById', err); }
        res.status(500).json({error: err});
      }
      else if (player === null) {
        res.status(404).json({error: 'Member not found.'});
      }
      else {
        res.json(player);
      }
    });
  },

  register: function (req, res) {
    var member = req.body;
    recaptcha.checkDirect(req, member.recaptcha_challenge_field, member.recaptcha_response_field, function (data) {
      if (data.passed === false) {
        res.status(403).json({errors: {recaptcha: data.error}});
      }
      else {
        var newMember = new Member(req.body);
        newMember.save(function (err, player) {
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
              console.error('members.register', err);
              res.status(422).json({bboName: error});
            }
          }
          else {
            res.json(player);
          }
        });
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
      var member = new Member(req.body);
      member.save(function (err, player) {
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
          res.json(player);
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
        res.json({error: 'Error updating member.'});
      }
      else {
        res.json(updated);
      }
    });
  },

  delete: function (req, res) {
    Member.findOne({_id: req.params.id}, function (err, player) {
      if (err) {
        console.error('members.delete', err);
        res.json({error: 'Member not found.'});
      }
      else {
        player.remove(function (err, player) {
          res.json(200, {status: 'Success'});
        });
      }
    });
  },

  export: function (req, res) {
    var sort = listQueryParameters.getSort(req, fields);
    var filter = listQueryParameters.getFindCriteria(req);
    Member.find(filter).count(function (err, count) {
          if (err) { console.error('members.getAll', err); }
          var aggr = [];
          aggr.push({$match: filter});
          aggr.push({$project: fieldDefinitions.projectFields(fields, {excludeId: true})});
          aggr.push({$sort: sort});
          Member.aggregate(aggr, function (err, members) {
                if (err) { console.error('members.export', err); }
                var type = req.params.type ? req.params.type.toLowerCase() : 'txt';
                exportToFile.export(type, members, res);
              }
          );
        }
    );
  }

}
;
