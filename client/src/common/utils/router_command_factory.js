var Backbone = require('backbone');
var $ = require('jquery');

module.exports = function (app, subApp, pagename, routes) {
  var router = {
    routes: {}
  };

  function execute(commandName, args) {
    args.unshift(commandName);
    app.commands.execute.apply(app.commands, args);
  }

  $.each(routes, function (route, commandName) {
    var functionName = commandName.replace(':', '_');

    app.vent.on('route:' + route, function () {
      // Replace :xxx parameters in route for the navigation.
      var n = 0;
      var args = Array.prototype.slice.call(arguments);
      var navRoute = route.replace(/\/:[^\/]*/g, function (match) {
        return n < args.length ? '/' + args[n++] : '/';
      });

      app.setModule(subApp);
      app.navigate(navRoute);
      execute(commandName, args);
    });

    router.routes[route] = functionName;
    router[functionName] = function () {
      var args = Array.prototype.slice.call(arguments);
      app.setModule(subApp);
      execute(commandName, args);
    };
  });

  return Backbone.Router.extend(router);
};
