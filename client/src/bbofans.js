var Backbone = require('backbone');
// Add jQuery to Backbone as it doesn't do it when using commonJS.
var $ = require('jquery');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var User = require('./common/models/user');
var MainLayoutController = require('./mainLayout/controller');

require('bootstrap');
require('bootstrap-table');
require('bootstrap-table-en-US');
require('ie10-viewport-bug-workaround');

var BboFansApp = Marionette.Application.extend({
  initialize: function (options) {
    if (window.bbofansUser && window.bbofansUser.username) {
      this.currentUser = new User(window.bbofansUser);
    }

    this.mainLayout = new MainLayoutController({
      el: options.container || '#bbofans-app-container'
    });
    this.navbarModule = require('./navbar/module')(this);
    this.homepageModule = require('./homepage/module.js')(this);
    this.rockModule = require('./rock/module.js')(this);
    this.rbdModule = require('./rbd/module.js')(this);
    this.adminModule = require('./admin/module.js')(this);
    this.membersModule = require('./member/module.js')(this);
    this.blacklistModule = require('./blacklist/module.js')(this);

    this.mainLayout.show();
    this.setModule(this.homepageModule);
  },

  navigate: function (route, options) {
    console.log('bbofansApp:navigate ' + route);
    Backbone.history.navigate(route, options || {});
  },

  getCurrentRoute: function () {
    return Backbone.history.fragment;
  },

  setModule: function (module) {
    if (this.currentModule !== module) {
      if (this.currentModule) { this.currentModule.stop(); }
      this.currentModule = module;
      this.currentModule.start();
    }
  },

  onStart: function () {
    $(document).on("ajaxError", function (e, xhr) {
      if (xhr.status === 403) {
        var route = xhr.getResponseHeader('Location');
        if (route) { route = route.substring(1); }
        else { route = 'login';}
        delete bbofansApp.currentUser;
        bbofansApp.unauthorizedRoute = route;
      }
    });

    this.navbarModule.start();

    if (Backbone.history) {
      Backbone.history.start({
        silent: false
      });
    }
  }

});

module.exports = BboFansApp;
