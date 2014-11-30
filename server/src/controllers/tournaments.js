var mongoose = require('mongoose');
var async = require('async');

var Tournament = mongoose.model('Tournament');
var Member = mongoose.model('Member');

function addScoreToMember(tournament, callback) {
  return function(err, member) {
    if (err) {
      console.log('Could not find member ' + bboName + ': ' + err);
      callback(); // ignore error!
      return;
    }
    
    try {
      member.addTournament(tournament);
      member.save(callback);
    }
    catch(e) {
      console.log('Exception thrown when adding scores for tournament ' + tournament.name + ' to member ' + member.bboName + ': ' + e.message);
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
 
module.exports = {
  index: function(req, res) {
    Tournament.find({}, function(err, tournament) {
      res.json(tournament);
    });
  },
  getById: function(req, res) {
    Tournament.find({ _id: req.params.id }, function(err, tournament) {
      if (err) {
        res.json({error: 'Tournament not found.'});
      } else {
        res.json(tournament);
      }
    });
  },
  add: function(req, res) {
    var newTournament = new Tournament(req.body);
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
    Tournament.findOne({ _id: req.params.id }, function(err, tournament) {
      if (err) {
        res.json({error: 'Tournament not found.'});
      } else {
        tournament.remove(function(err, tournament){
          res.json(200, {status: 'Success'});
        });
      }
    });
  }
};
