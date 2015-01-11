/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var _ = require('underscore');
var messageBus = require('./messageBus');
var Path = require('./../utils/path');
var routerHistory = require('./routerHistory');

function routerCommandFactory(app, routes) {
  var router = {
    routes: {}
  };

  _.each(routes, function (path, route) {
    // Camelize the path by removing the / and capitalizing the next letter. All '/:<param>' parts are removed.
    var functionName = route.replace(/\/:?(\w)/g, function (match, name) {
      return name.toUpperCase();
    });
    var pathObj = new Path(path);
    var moduleName = pathObj.getFullModuleName();

    // Route internally
    messageBus.comply('route:' + route, function () {
      // Replace :xxx parameters in route for the navigation.
      var n = 0;
      var args = _.toArray(arguments);

      // replace :<name> with arguments in order
      var navRoute = route.replace(/\/:[^\/]*/g, function (match) {
        return n < args.length ? '/' + args[n++] : '/';
      });

      routerHistory.add(navRoute);
      app.setModule(moduleName);
      app.navigate(navRoute);
      _.callMethod(app.render, app, [new Path(path), args]);
    });

    // Route via history.
    router.routes[route] = functionName;
    router[functionName] = function () {
      routerHistory.add(route);
      var args = _.toArray(arguments);
      app.setModule(moduleName);
      _.callMethod(app.render, app, [new Path(path), args]);
    };
  });

  return Backbone.Router.extend(router);
}

module.exports = routerCommandFactory;
