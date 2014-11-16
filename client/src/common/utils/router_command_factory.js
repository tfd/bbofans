var Backbone = require('backbone');
var $ = require('jquery');

module.exports = function (app, pagename, routes) {
  var router = {
    routes: {}
  };

  $.each(routes, function (route, commandName) {
    var functionName = commandName.replace(':', '_');

    app.on(pagename + ':' + route, function () {
      app.navigate(route);
      app.execute(commandName);
    });

    router.routes[route] = functionName;
    router[functionName] = function () {
      app.execute(commandName);
    };
  });

  return Backbone.Router.extend(router);
};
