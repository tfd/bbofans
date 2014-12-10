var Backbone = require('backbone');

User = Backbone.Model.extend({
  urlRoot: "users",

  defaults: {
    username: "",
    password: "",
    isMemberManager: false,
    isBlacklistManager: false,
    isTdManager: false,
    isUserManager: false
  },

  validate: function(attrs, options) {
    var errors = {};
    if (! attrs.username) {
      errors.username = "can't be blank";
    }
    if (! attrs.password) {
      errors.password = "can't be blank";
    }
    if( ! _.isEmpty(errors)){
      return errors;
    }
  }
});

module.exports = User;
