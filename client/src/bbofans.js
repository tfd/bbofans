var Backbone = require('backbone');
// Add jQuery to Backbone as it doesn't do it when using commonJS.
Backbone.$ = require('jquery');
var Marionette = require('backbone.marionette');
var User = require('./common/models/user');

require('bootstrap');
require('bootstrap-table');
require('bootstrap-table-en-US');
require('ie10-viewport-bug-workaround');

var bbofansApp = new Marionette.Application();

bbofansApp.vent.on('app:log', function (msg) {
  console.log(msg);
});

bbofansApp.navigate = function (route,  options) {
  bbofansApp.vent.trigger('app:log', 'bbofansApp:navigate ' + route);
  Backbone.history.navigate(route, options || {});
};

bbofansApp.getCurrentRoute = function () {
  return Backbone.history.fragment;
};

bbofansApp.setApp = function (app) {
  if (this.currentApp != app) {
    this.currentApp = app;
    this.currentApp.activate();
  }
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
  content: '#bbofans-container',
  popup: '#bbofans-popup'
});  

if (window.bbofansUser && window.bbofansUser.username) {
  bbofansApp.currentUser = new User(window.bbofansUser);
}

module.exports = bbofansApp;
