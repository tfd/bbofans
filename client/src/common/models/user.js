var Backbone = require('backbone');

User = Backbone.Model.extend({
  urlRoot: "admin/login",

  defaults: {
    username: "",
    password: ""
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
