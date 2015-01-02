var Backbone = require('backbone');
var _ = require('underscore');

var Member = Backbone.Model.extend({
  urlRoot: "admin/members",
  idAttribute: "_id",
  
  defaults: {
    bboName: "",
    name: "",
    email: "",
    nation: "Netherlands",
    level: "Beginner",
    isStarPlayer: false
  },

  validate: function(attrs) {
    var errors = {};
    if (! attrs.bboName) {
      errors.bboName = "can't be blank";
    }
    if (! attrs.name) {
      errors.name = "can't be blank";
    }
    if (! attrs.email) {
      errors.email = "can't be blank";
    }
    if( ! _.isEmpty(errors)){
      return errors;
    }
  }
});

module.exports = Member;