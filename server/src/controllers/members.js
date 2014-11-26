var model = require('../models/member');
var recaptcha = require('../controllers/recaptcha');

function getLimit (req) {
  var limit = 10;
  if (req.query.limit) {
    limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 10) {
      limit = 10;
    }
    else if (limit > 100) {
      limit = 100;
    }
  }
  return limit;
}

function getSkip (req) {
  var skip = 0;
  if (req.query.offset) {
    skip = parseInt(req.query.offset, 10);
    if (isNaN(skip) || skip < 0) {
      skip = 0;
    }
  }
  return skip;
}

function getSort (req, fields) {
  var sort = {};
  var field = 'bboName';
  var order = 'asc';
  if (req.query.sort && fields.indexOf(req.query.sort) >= 0) {
    field = req.query.sort;
  } 
  if (req.query.order && ['asc', 'desc'].indexOf(req.query.order) >= 0) {
    order = req.query.order;
  }
  var sort = {};
  sort[field] = (order === 'asc' ? 1 : -1);
  return sort;
}

function getOrder (req) {
  if (req.query.order && ['asc', 'desc'].indexOf(req.query.order) >= 0) {
    return req.query.order;
  }
  return 'asc';
}

module.exports = {
  
  index: function (req, res) {
    console.log(req.query);
    var limit = getLimit(req);
    var skip = getSkip(req);
    var sort = getSort(req, ['bboName', 'nation', 'level', 'awards', 'averageMatchPoints']);
    model.Member.find({})
                .exec(function (err, data) {
      res.json(data);
    });
  },
  
  getRock: function (req, res) {
    var limit = getLimit(req);
    var skip = getSkip(req);
    var sort = getSort(req, ['bboName', 'nation', 'level', 'awards', 'averageMatchPoints']);
    model.Member.find({}).count().exec(function (err, count) {
      model.Member.aggregate({
                     $project: {
                       bboName: 1,
                       nation: 1,
                       level: 1,
                       awards: "$rock.totalScores.awards",
                       averageMatchPoints: "$rock.totalScores.averageMatchPoints"
                   }})
                  .sort(sort)
                  .skip(skip)
                  .limit(limit)
                  .exec(function (err, data) {
        res.json({
          skip: skip,
          limit: limit,
          sort: sort,
          total: count,
          rows: data
        });
      });
    });
  },

  getById: function (req, res) {
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
