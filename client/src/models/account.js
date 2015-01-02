var Backbone = require('backbone');
var Member = require('./member');
var _ = require('underscore');

/**
 * Account model.
 *
 * @class
 * @constructor
 * @augments Member
 */
var Account = Member.extend({
  urlRoot: "admin/account"
});

module.exports = Account;
