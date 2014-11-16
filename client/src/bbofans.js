require('bootstrap');
require('ie10-viewport-bug-workaround');

var Backbone = require('backbone');
// Add jQuery to Backbone as it doesn't do it when using commonJS.
Backbone.$ = require('jquery');
var Marionette = require('backbone.marionette');

var bbofansApp = new Marionette.Application();
module.exports = bbofansApp;

bbofansApp.vent.on('app:log', function(msg) {
    console.log(msg);
});

bbofansApp.navigate = function(route,  options) {
  bbofansApp.vent.trigger('app:log', 'bbofansApp: navigate ' + route);
  Backbone.history.navigate(route, options || {});
};

bbofansApp.getCurrentRoute = function() {
  return Backbone.history.fragment;
};

bbofansApp.on('start', function () {
  bbofansApp.vent.trigger('app:log', 'bboFans: start');
  if (Backbone.history) {
    Backbone.history.start({
      silent: false
    });
  }
});

bbofansApp.addRegions({
  content: '#bbofans-container'
});  

require('./homepage/module');
