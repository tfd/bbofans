/* jshint -W097 */
"use strict";

var mongoose = require('mongoose');
var async = require('async');

var Tournament = mongoose.model('Tournament');
var Member = mongoose.model('Member');

module.exports = function () {

  function addScoreToMember(tournament, callback) {
    return function (err, member) {
      if (err) {
        console.log('Could not find member ' + member.bboName + ': ' + err);
        callback(); // ignore error!
        return;
      }

      try {
        if (member) {
          member.addTournament(tournament);
          member.save(callback);
        }
      }
      catch (e) {
        console.log('Exception thrown when adding scores for tournament ' + tournament.name + ' to member ' +
                    member.bboName + ': ' + e.message);
        callback(); // ignore error!
      }
    };
  }

  function processPlayer(tournament) {
    return function (bboName, callback) {
      Member.find({bboName: bboName}, addScoreToMember(tournament, callback));
    };
  }

  function processResult(tournament) {
    return function (result, callback) {
      async.eachSeries(result.players, processPlayer(tournament), callback);
    };
  }

  function addTournamentToPlayers(tournament, callback) {
    async.eachSeries(tournament.results, processResult(tournament), callback);
  }

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
      this.addTournament(req.body, function (err, tournament) {
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
    },

    addTournament: function (tournament, cb) {
      Tournament.findOne({name: tournament.name}, function (err, t) {
        if (err) {
          console.log('tournaments.addTournament', err);
          return cb(err, null);
        }

        if (t) {
          // tournament already added., just skip
          console.log('tournaments.addTournament', 'Tournament "' + t.name + '" already added');
          return cb(null, t);
        }

        var newTournament = new Tournament(tournament);
        newTournament.save(function (err, tournament) {
          if (err) {
            console.error('tournaments.addTournament', err);
            cb({error: 'Error adding Tournament.'}, null);
          }
          else {
            addTournamentToPlayers(tournament, cb);
          }
        });
      });
    }
  };
};
