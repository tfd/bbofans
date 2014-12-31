var Marionette = require('backbone.marionette');
var routerFactory = require('../utils/routerCommandFactory');
var messageBus = require('../utils/messageBus');
var _ = require('underscore');

/**
 * Base module for automatizing routing.
 *
 * A module that uses this as a moduleClass should have at least the following implementations.
 *
 * # routes
 *
 * A hash of routes in the following format:
 *
 * <code>
 *   {
 *     'admin/members/:id': '[admin.member]edit:show'
 *   }
 * </code>
 *
 * The key is the path as found after the hash. The value is a path in the form [<modules>]<controller>:<method>. When
 * the route is activated it will start the modules and call renderLayout on all modules in order. After all layouts
 * have been rendered the renderController method will be called on the last module.
 *
 * # renderLayout
 *
 * Every module must implement this function with the following signature:
 *
 * <code>
 *   function renderLayout(region) {
 *     region.show(layout);
 *   }
 * </code>
 *
 * # renderController
 *
 * Every module must implement this function with the following signature:
 *
 * <code>
 *   function renderController(controllerName, methodName) {
 *     // do whathever is needed
 *   }
 * </code>
 *
 * # getSubModuleRegion
 *
 * Every module must implement this function with the following signature:
 *
 * <code>
 *   function getSubModuleRegion() {
 *     // return the region where subModules should be rendered.
 *     return subRegion;
 *   }
 * </code>
 *
 * # Attention
 *
 * The base module implements onStart and initialize so a derived module can't use these function directly. If you need
 * the functionality code the following:
 *
 * <code>
 *   var myModule = app.module('admin.blacklist', {
 *     moduleClass: baseModule,
 *
 *     routes: {
 *       'admin/blacklist': [admin.blacklist]list:show'
 *     },
 *
 *     define: function (myModule, app, Backbone, Marionette, _, $) {
 *       // do what you need to do
 *     },
 *
 *     renderLayout(region) {
 *       // render your layout
 *     },
 *
 *     renderController(controllerName, methodName) {
 *       // render the controller
 *     },
 *
 *     getSubModuleRegion() {
 *       // Eventually return a region where a subModule can be rendered.
 *       return null;
 *     }
 *   });
 *
 *   myModule.on('before:start', function () {
 *     // do something before the BasModule.onStart is called.
 *   });
 *
 *   myModule.on('start', function () {
 *     // do something after the BasModule.onStart is called.
 *   });
 */
var BaseModule = Marionette.Module.extend({
  moduleName     : 'BaseModule',
  startWithParent: false,

  initialize: function (moduleName, app, options) {
    var self = this;
    this.moduleName = moduleName;
    this.app = app;
    this.options = options || {};
    this.controllers = {};

    var Router = routerFactory(app, this.options.routes);

    app.on('before:start', function () {
      self.router = new Router();
    });

    this.triggerMethod('initialized', options);
  },

  onStart: function () {
    this.firstTime = true;
  },

  render: function (path, region) {
    messageBus.command('log', 'render', path.getFullModuleName(), region);
    var args = _.toArray(arguments);
    args = _.rest(args, 2);

    if (this.firstTime) {
      _.callMethod(this.renderLayout, this, [region, args]);
      this.firstTime = false;
    }
    if (path.isLastModule()) {
      _.callMethod(this.renderController, this, [path.getControllerName(), path.getMethodName(), args]);
    }
    else {
      var module = this.app.module(path.getNextModuleName());
      _.callMethod(module.render, module, [path, this.getSubModuleRegion(), args]);
    }
  },

  existsControllerMethod: function (controllerName, methodName) {
    if (!this.controllers[controllerName]) {
      // oops no such controller.
      messageBus.command('log', 'No controller "' + controllerName + '" in module ' + this.moduleName);
      return false;
    }

    if (!this.controllers[controllerName][methodName]) {
      // oops no such method.
      messageBus.command('log', 'No method "' + controllerName + ':' + methodName + '" in module ' + this.moduleName);
      return false;
    }

    return true;
  },

  renderController: function (controllerName, methodName) {
    messageBus.command('log', 'renderController', controllerName, methodName);
    if (this.existsControllerMethod(controllerName, methodName)) {
      var controller = this.controllers[controllerName];
      var args = _.toArray(arguments);
      args = _.rest(args, 2);
      _.callMethod(controller[methodName], controller, [this.getSubModuleRegion(), args]);
    }
  }

});

module.exports = BaseModule;
