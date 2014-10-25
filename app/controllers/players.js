var model = require('../models/player');

module.exports = {
    index: function(req, res) {
        model.Player.find({}, function(err, data) {
            res.json(data);
        });
    },
    getById: function(req, res) {
        model.Player.find({ _id: req.params.id }, function(err, player) {
            if (err) {
                res.json({error: 'Player not found.'});
            } else {
                res.json(player);
            }
        });
    },
    add: function(req, res) {
        var newPlayer = new model.Player(req.body);
        newPlayer.save(function(err, player) {
            if (err) {
                res.json({error: 'Error adding player.'});
            } else {
                res.json(player);
            }
        });
    },
    // update: function(req, res) {
    //     console.log(req.body);
    //     models.Player.update({ _id: req.body.id }, req.body, function(err, updated) {
    //         if (err) {
    //             res.json({error: 'player not found.'});
    //         } else {
    //             res.json(updated);
    //         }
    //     })
    // },
    delete: function(req, res) {
        model.Player.findOne({ _id: req.params.id }, function(err, player) {
            if (err) {
                res.json({error: 'Player not found.'});
            } else {
                player.remove(function(err, player){
                    res.json(200, {status: 'Success'});
                })
            }
        });
    }
};
