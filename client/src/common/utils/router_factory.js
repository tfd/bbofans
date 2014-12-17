var Backbone = require('backbone');
var $ = require('jquery');

module.exports = function (app, subApp, pagename, controller, routes) {
  var router = {
    routes: routes
  };

  $.each(routes, function (route, functionName) {
    app.vent.on(pagename + ':' + route, function () {
      // Replace :xxx parameters in route for the navigation.
      var args = Array.prototype.slice.call(arguments);
      var navRoute = route.replace(/\/:[^\/]*/g, function (match) {
        return args.shift();
      });

      app.setApp(subApp);
      app.navigate(navRoute);
      controller[functionName].apply(controller, args);
    });

    router[functionName] = function () {
      var args = Array.prototype.slice.call(arguments);

      app.setApp(subApp);
      controller[functionName].apply(controller, args);
    };
  });

  return Backbone.Router.extend(router);
};
