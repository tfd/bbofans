/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var $ = require('jquery');

var commands = ['enable', 'disable', 'blacklist', 'whitelist', 'ban', 'unban', 'validate'];

$.each(commands, function (i, cmd) {
  module.exports[cmd] = Backbone.Model.extend({
    urlRoot: 'admin/commands/' + cmd,
    idAttribute: "_id",
    
    defaults: {
      rows: [],
    }
  });
});
