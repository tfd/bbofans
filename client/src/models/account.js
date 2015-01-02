var Backbone = require('backbone');
var Register = require('./register');
var _ = require('underscore');

/**
 * Account model.
 *
 * @class
 * @constructor
 * @augments Register
 */
var Account = Register.extend({
  urlRoot: "admin/account",

  validate: function(attrs) {
    var errors = Member.prototype.validate.call(this, attrs) || {};
    if (! attrs.password) {
      errors.password = "cannot be blank";
    }
    if (attrs.password !== attrs.repeatPassword) {
      errors.repeatPassword = "doesn't match";
    }
    if (!_.isEmpty(errors)) {
      return errors;
    }
  }

});

module.exports = Account;
