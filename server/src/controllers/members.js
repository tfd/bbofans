var model = require('../models/member');

module.exports = {
  
  index: function(req, res) {
    model.Member.find({}, function (err, data) {
      res.json(data);
    });
  },
  
  getById: function(req, res) {
    model.Member.find({ _id: req.params.id }, function (err, player) {
      if (err) {
        res.json({error: 'Member not found.'});
      } else {
        res.json(player);
      }
    });
  },
  
  add: function(req, res) {
    var newMember = new model.Member(req.body);
    newMember.save(function (err, player) {
      if (err) {
        res.json({error: 'Error adding member.'});
      } else {
        res.json(player);
      }
    });
  },
  
  update: function(req, res) {
    var id = req.body._id;
    delete req.body._id;
    model.Member.findByIdAndUpdate(id, { $set: req.body }, function (err, updated) {
      if (err) {
        res.json({error: 'Error updating member.'});
      } else {
        res.json(updated);
      }
    });
  },

  delete: function(req, res) {
    model.Member.findOne({ _id: req.params.id }, function (err, player) {
      if (err) {
        res.json({error: 'Member not found.'});
      } else {
        player.remove(function(err, player){
          res.json(200, {status: 'Success'});
        });
      }
    });
  }

};
