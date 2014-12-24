var Backbone = require('backbone');
var moment = require('moment');

AddBlacklist = Backbone.Model.extend({
  urlRoot: "admin/blacklist/entry",
  idAttribute: "_id",
  
  defaults: {
    bboName: "",
    'from': moment().toDate(),
    'for': '6d',
    reason: ''
  },

  validate: function (attrs, options) {
    var errors = {};
    if (! attrs.bboName) {
      errors.bboName = "can't be blank";
    }
    if (! attrs.reason) {
      errors.reason = "can't be blank";
    }
    if (! attrs.from) {
      errors.from = "can't be blank";
    }
    else {
      if (! moment.utc(attrs.from).isValid()) {
        errors.from = "is invalid";
      }
    }
    if(! _.isEmpty(errors)) {
      return errors;
    }
  },

  set: function(attributes, options) {
    if (attributes.from) {
      attributes.from = moment.utc(attributes.from).toISOString();
    }
    return Backbone.Model.prototype.set.call(this, attributes, options);
  }
  
});

module.exports = AddBlacklist;
