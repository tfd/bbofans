var model = require('../models/tournament');

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
