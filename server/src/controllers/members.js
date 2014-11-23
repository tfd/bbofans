var model = require('../models/member');
var recaptcha = require('../controllers/recaptcha');

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
    var member = req.body;
    recaptcha.checkDirect(req, member.recaptcha_challenge_field, member.recaptcha_response_field, function (data) {
      if (data.passed === false) {
        res.status(403).json({errors: {recaptcha: data.error}});
      }
      else {
        var newMember = new model.Member(req.body);
        newMember.save(function (err, player) {
          if (err) {
            var error = err.err.toString();
            if (error.indexOf('E11000 duplicate key error') === 0) {
              var fieldName = error.match(/members\.\$(.*)_\d/i)[1];
              var fieldValue = error.match(/dup\skey:\s\{\s:\s\"(.*)\"\s\}/)[1];
              var errors = {};
              errors[fieldName] = 'Value "' + fieldValue + '" already present in database';
              res.status(409).json(errors);
            }
            else {
              console.log(err);
              res.status(422).json({bboName: error});
            }
          } else {
            res.json(player);
          }
        });
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
