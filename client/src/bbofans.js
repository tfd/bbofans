var Backbone = require('backbone');
// Add jQuery to Backbone as it doesn't do it when using commonJS.
var $ = require('jquery');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var messageBus = require('./common/utils/messageBus');
// Add radio shim to Marionette, as version 2.1 still uses wreqr instead of radio
require('./common/utils/radioShim');
var User = require('./common/models/user');
var MainLayoutController = require('./mainLayout/controller');
var moment = require('moment');
var _ = require('underscore');
require('./common/utils/callMethod');

require('bootstrap');
require('bootstrap-table');
require('bootstrap-table-en-US');
require('ie10-viewport-bug-workaround');

var BboFansApp = Marionette.Application.extend({
  initialize: function (options) {
    this.authentication = require('./authentication/controller');

    this.mainLayout = new MainLayoutController({
      el: options.container || '#bbofans-app-container'
    });
    this.navbarModule = require('./navbar/module')(this);
    this.homepageModule = require('./homepage/module.js')(this);
    this.adminModule = require('./admin/module.js')(this);
    this.membersModule = require('./members/module.js')(this, 'admin');
    this.blacklistModule = require('./blacklist/module.js')(this, 'admin');
  },

  getPopupRegion: function () {
    return this.mainLayout.popup;
  },

  showPopup: function () {
    this.mainLayout.showPopup();
  },

  hidePopup: function () {
    this.mainLayout.hidePopup();
  },

  navigate: function (route, options) {
    messageBus.command('log', 'navigate', route);
    Backbone.history.navigate(route, options || {});
  },

  getCurrentRoute: function () {
    return Backbone.history.fragment;
  },

  setModule: function (moduleName) {
    var module = this.module(moduleName);
    if (this.currentModule !== module) {
      if (this.currentModule) { this.currentModule.stop(); }
      this.currentModule = module;
      this.currentModule.start();
    }
  },

  render: function (path) {
    var args = _(arguments).toArray().rest();
    var module = this.app.module(path.getModuleName());
    _.callMethod(module.render, module, [path, this.mainLayout.regions.content, args]);
  },

  onStart: function () {
    var self = this;

    $(document).on("ajaxError", function (e, xhr) {
      if (xhr.status === 403) {
        var route = xhr.getResponseHeader('Location');
        if (route) { route = route.substring(1); }
        else { route = 'login';}
        self.authentication.logout();
      }
    });

    messageBus.comply('navigate', this.navigate, this);
    messageBus.comply('log', function () {
      var args = _.flatten([
        moment().format(),
        Array.prototype.slice.call(arguments)
      ]);
      console.log.apply(console, args);
    });

    this.mainLayout.show();
    this.navbarModule.start();
    this.navbarModule.show(this.mainLayout.regions.navbar);
    this.setModule(this.homepageModule);

    if (Backbone.history) {
      Backbone.history.start({
        silent: false
      });
    }
  }

});

module.exports = BboFansApp;
