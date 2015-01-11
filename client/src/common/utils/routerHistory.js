/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var messageBus = require('./messageBus');

var history = [];

module.exports = {

  add: function (route) {
    history.push(route);
    if (history.length > 100) {
      history.shift();
    }
  },

  get: function () {
    if (history.length > 0) {
      return history.pop();
    }
    return null;
  },

  back: function () {
    var route = this.get(); // Get current page
    route = this.get(); // Get previous page
    if (route === null) {
      var fragment = Backbone.history.fragment;
      var parts = fragment.split('/');
      route = parts.slice(0, parts.length - 1).join('/');
    }
    messageBus.command('route:' + route);
  }

};