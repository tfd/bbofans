var Marionette = require('backbone.marionette');
var routerFactory = require('../utils/router_command_factory');

var BaseModule = Marionette.Module.extend({
  startWithParent: false,

  initialize: function(moduleName, app, options) {
    var self = this;
    this.moduleName = moduleName;
    this.app = app;
    this.options = options || {};

    var Router = routerFactory(app, this, moduleName, options.routes);

    app.on('before:start', function () {
      self.router = new Router();
    });
  }
});

module.exports = BaseModule;
