/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var MemberWithPassword = require('./memberWithPassword');
var _ = require('underscore');

var Registrant = MemberWithPassword.extend({
  urlRoot: "register"
});

module.exports = Registrant;
