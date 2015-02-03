/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var async = require('async');

var Tournament = mongoose.model('Tournament');
var Member = mongoose.model('Member');

/**
 * All field names in the table.
 *
 * @type {string[]}
 */
var fields = ['name', 'date', 'resultsUrl', 'boardsUrl', 'isPair', 'isRbd', 'numPlayers', 'results'];

/**
 * Hashmap of field names to flat names.
 *
 * The bootstrap-table isn't able to interpret nested JSON objects so I use
 * $project to rename nested fields. This hashmap reconstructs the correct
 * nested name from the projected name.
 */
var field2FlatNames = {};
var fieldDefinitions = require('../utils/fieldDefinitions')(Member, fields, field2FlatNames);
var listQueryParameters = require('../utils/listQueryParameters')(fieldDefinitions);

function getTournaments(req, criteria, cb) {
  var limit = listQueryParameters.getLimit(req);
  var skip = listQueryParameters.getSkip(req);
  var sort = listQueryParameters.getSort(req, ['name', 'date', 'isPair', 'isRbd', 'numPlayers']);
  var filter = listQueryParameters.getFindCriteria(req, {
    criteria: criteria,
    searchFields: ['name']
  });
  Tournament.find(filter).count(function (err, count) {
    if (err) {
      console.error('tournaments.index', err);
      return cb({error: 'No tournament found.'});
    }

    Tournament
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(function (err, tournaments) {
          if (err) {
            console.error('tournaments.index', err);
            return cb({error: 'No tournament found.'});
          }

          cb(null, tournaments);
        });
  });
}

module.exports = function () {

  return {

    getAll: function (req, res) {
      getTournaments(req, null, function (err, tournaments) {
        if (err) {
          return res.status(404).json(err);
        }

        res.json(tournaments);
      });
    },

    getRock: function (req, res) {
      getTournaments(req, {isRbd: false}, function (err, tournaments) {
        if (err) {
          return res.status(404).json(err);
        }

        res.json(tournaments);
      });
    },

    getRbd: function (req, res) {
      getTournaments(req, {isRbd: true}, function (err, tournaments) {
        if (err) {
          return res.status(404).json(err);
        }

        res.json(tournaments);
      });
    },

    getById: function (req, res) {
      Tournament.find({_id: req.params.id}, function (err, tournament) {
        if (err) {
          console.getById('tournaments.addTournament', err);
          res.json({error: 'Tournament not found.'});
        }
        else {
          res.json(tournament);
        }
      });
    },

    add: function (req, res) {
      Tournament.addTournament(req.body, function (err, tournament) {
        if (err) {
          res.json({error: 'Error adding Tournament.'});
        }
        else {
          res.json(tournament);
        }
      });
    },

    // update: function(req, res) {
    //     console.log(req.body);
    //     models.Contact.update({ _id: req.body.id }, req.body, function(err, updated) {
    //         if (err) {
    //             res.json({error: 'Contact not found.'});
    //         } else {
    //             res.json(updated);
    //         }
    //     })
    // },

    delete: function (req, res) {
      Tournament.findOne({_id: req.params.id}, function (err, tournament) {
        if (err) {
          console.error('tournaments.delete', err);
          res.json({error: 'Tournament not found.'});
        }
        else {
          tournament.remove(function (err, tournament) {
            res.json(200, {status: 'Success'});
          });
        }
      });
    }
  };
};
