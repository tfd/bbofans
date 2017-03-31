/* jshint -W097 */
"use strict";

var BaseModule = require('./baseModule');
var messageBus = require('../router/messageBus');
var authentication = require('../../authentication/controller');
var _ = require('underscore');

var AuthenticatedModule = BaseModule.extend({
  onStart: function () {
    BaseModule.prototype.onStart.call(this);

    var self = this;
    this.triggerMethod('before:authentication');

    authentication.isAuthenticated(function (auth) {
      if (!auth) {
        self.triggerMethod('failed:authentication');
        _.delay(_.bind(messageBus.trigger, messageBus), 1, 'route:login');
      }
      else {
        self.triggerMethod('authenticated');
      }
    });
  }

});

module.exports = AuthenticatedModule;
