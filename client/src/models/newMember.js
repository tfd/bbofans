/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var MemberWithPassword = require('./memberWithPassword');
var moment = require('moment');
var _ = require('underscore');

var NewMember = MemberWithPassword.extend({

  set: function (attributes, options) {
    attributes.registeredAt = moment.utc().toDate();
    attributes.validatedAt = moment.utc().toDate();
    return MemberWithPassword.prototype.set.call(this, attributes, options);
  }

});

module.exports = NewMember;
