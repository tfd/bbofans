
/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;
var mongooseTypes = require("nifty-mongoose-types");
mongooseTypes.loadTypes(mongoose);
var moment = require('moment');

/*
 * Member Schema
 */

var EntrySchema = new Schema({
  from   : {type : Date},
  to     : {type : Date},
  reason : {type : String, default : '', trim : true}
}, {
  id: false,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

EntrySchema.virtual('fromDate').get(function () {
                                      return moment(this.from).format('DD-MM-YYYY');
                                    })
                               .set(function (val) {
                                      this.from = moment(val, 'DD-MM-YYYY').toDate();
                                      console.log('fromDate', val, this.from);
                                    });
EntrySchema.virtual('toDate').get(function () {
                                    return moment(this.to).format('DD-MM-YYYY');
                                  })
                             .set(function (val) {
                                    this.to = moment(val, 'DD-MM-YYYY').toDate();
                                    console.log('toDate', val, this.to);
                                  });

var BlacklistSchema = new Schema({
  bboName   : {type : String, required : 'BBO name cannot be blank', unique: true, trim : true},
  entries   : [EntrySchema],
  createdAt : {type : Date, default: Date.now}
});

/*
 * Helper functions.
 */

function handleError(msg, cb) {
  if (typeof cb === 'function') {
    cb(new Error(msg), null);
  }
}

/*
 * Methods
 */

BlacklistSchema.methods = {
  isMember: function (cb) {
    var Member = mongoose.model('Member');
    Member.findOne({ bboName : this.bboName }, function (err, member) {
      if (cb) cb(err || (member === null) ? false : true);
    });
  }
};

module.exports = mongoose.model('Blacklist', BlacklistSchema);
