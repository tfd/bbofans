/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var async = require('async');

var Tournament = mongoose.model('Tournament');
var Member = mongoose.model('Member');

module.exports = function () {

  return {
    index: function (req, res) {
      Tournament.find({}, function (err, tournament) {
        if (err) {
          console.error('tournaments.index', err);
          res.json({error: 'No tournament found.'});
        }
        else {
          res.json(tournament);
        }
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
