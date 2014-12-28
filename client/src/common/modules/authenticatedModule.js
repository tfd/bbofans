var BaseModule = require('./baseModule');
var messageBus = require('../utils/messageBus');
var authentication = require('../../authentication/controller');

var AuthenticatedModule = BaseModule.extend({
  onStart: function () {
    this.triggerMethod('before:authentication');

    authentication.isAuthenticated(function (auth) {
      if (!auth) {
        this.triggerMethod('failed:authentication');
        messageBus.command('route:admin/login');
        return;
      }

      this.triggerMethod('authenticated');
    });
  }

});

module.exports = BaseModule;
