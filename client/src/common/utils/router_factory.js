var Backbone = require('backbone');
var $ = require('jquery');
var bbofansApp = require('../../bbofans');

module.exports = function (pagename, controller, routes) {
  var router = {
    routes: routes
  };

  $.each(routes, function (route, functionName) {
    bbofansApp.on(pagename + ':' + route, function () {
      bbofansApp.navigate(route);
      controller[functionName]();
    });

    router[functionName] = function () {
      controller[functionName]();
    };
  });

  return Backbone.Router.extend(router);
};
