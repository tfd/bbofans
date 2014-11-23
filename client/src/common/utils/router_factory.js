var Backbone = require('backbone');
var $ = require('jquery');

module.exports = function (app, subApp, pagename, controller, routes) {
  var router = {
    routes: routes
  };

  $.each(routes, function (route, functionName) {
    app.on(pagename + ':' + route, function () {
      app.setApp(subApp);
      app.navigate(route);
      controller[functionName]();
    });

    router[functionName] = function () {
      app.setApp(subApp);
      controller[functionName]();
    };
  });

  return Backbone.Router.extend(router);
};
