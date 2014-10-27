var model = require('../models/tournament');
var async = require('async');

function addScoreToPlayer(tournament, callback) {
  return function(err, player) {
    if (err) {
      console.log('Could not find player ' + bboName + ': ' + err);
      callback(); // ignore error!
    }
    
    try {
      player.addTournament(tournament);
      player.save(callback);
    }
    catch(e) {
      console.log('Exception thrown when adding scores for tournament ' + tournament.name + ' to player ' + player.bboName + ': ' + e.message);
      callback(); // ignore error!
    }
  }
}

function processPlayer(Players, tournament) {
  return function (bboName, callback) {
    Players.find({bboName: bboName}, addScoreToPlayer(tournament, callback));
  };
}

function processResult(Players, tournament) {
  return function (result, callback) {
    async.eachSeries(result.players, processPlayer(Players, tournament), callback);
  }
}

function addTournamentToPlayers(tournament, callback) {
  var Players = tournament.model('Player');
  async.eachSeries(tournament.results, processResult(Players, tournament), callback);
}
 
module.exports = {
  index: function(req, res) {
    model.Tournament.find({}, function(err, tournament) {
      res.json(tournament);
    });
  },
  getById: function(req, res) {
    model.Tournament.find({ _id: req.params.id }, function(err, tournament) {
      if (err) {
        res.json({error: 'Tournament not found.'});
      } else {
        res.json(tournament);
      }
    });
  },
  add: function(req, res) {
    var newTournament = new model.Tournament(req.body);
    newTournament.save(function(err, tournament) {
      if (err) {
        res.json({error: 'Error adding Tournament.'});
      } else {
        addTournamentToPlayers(tournament, function (err) {
          res.json(tournament);
        });
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
  delete: function(req, res) {
    model.Tournament.findOne({ _id: req.params.id }, function(err, tournament) {
      if (err) {
        res.json({error: 'Tournament not found.'});
      } else {
        tournament.remove(function(err, tournament){
          res.json(200, {status: 'Success'});
        })
      }
    });
  }
};
