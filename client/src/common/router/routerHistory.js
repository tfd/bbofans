/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var messageBus = require('./messageBus');

var routerHistory = [];

module.exports = {

  add: function (route) {
    routerHistory.push(route);
    if (routerHistory.length > 100) {
      routerHistory.shift();
    }
  },

  get: function () {
    if (routerHistory.length > 0) {
      return routerHistory.pop();
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
    messageBus.trigger('route:' + route);
  }

};