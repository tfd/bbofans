/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
// Add jQuery to Backbone as it doesn't do it when using commonJS.
var $ = require('jquery');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var messageBus = require('./common/utils/messageBus');
// Add radio shim to Marionette, as version 2.1 still uses wreqr instead of radio
require('./common/utils/radioShim');
var User = require('./models/user');
var MainLayoutController = require('./mainLayout/controller');
var moment = require('moment');
var _ = require('underscore');
require('./common/utils/callMethod');

require('bootstrap');
require('bootstrap-table');
require('bootstrap-table-en-US');
require('ie10-viewport-bug-workaround');
require('bootstrap-material-design');
require('./common/utils/reCaptcha.js');
require('tinymce-modern');

var BboFansApp = Marionette.Application.extend({
  initialize: function (options) {
    this.authentication = require('./authentication/controller');

    this.mainLayout = new MainLayoutController({
      el: options.container || '#bbofans-app-container'
    });
    this.navbarModule = require('./navbar/module')(this);
    require('./homepage/module.js')(this);
    require('./admin/module.js')(this);
    require('./members/module.js')(this, 'admin');
    require('./blacklist/module.js')(this, 'admin');
    require('./tds/module.js')(this, 'admin');
    require('./account/module.js')(this, 'admin');
  },

  getPopupRegion: function () {
    return this.mainLayout.regions.popup;
  },

  showPopup: function () {
    this.mainLayout.showPopup();
    messageBus.trigger('popup:show');
  },

  hidePopup: function () {
    this.mainLayout.hidePopup();
  },

  navigate: function (route, options) {
    Backbone.history.navigate(route, options || {});
  },

  getCurrentRoute: function () {
    return Backbone.history.fragment;
  },

  startModule: function (modules, n) {
    var i;
    var name;
    n = n || 1;

    for (i = modules.length; i >= n; i -= 1) {
      name = _.first(modules, i).join('.');
      this.module(name).start();
    }
  },

  stopModule: function (modules, n) {
    var name = _(modules).first(n).join('.');
    this.module(name).stop();
  },

  setModule: function (moduleName) {
    var newModules = moduleName.split('.');

    if (!this.currentModuleName) {
      this.currentModuleName = moduleName;
      this.startModule(newModules);
    }
    else  {
      var currentModules = this.currentModuleName.split('.');
      var commonModules = _.intersection(currentModules, newModules);
      if (commonModules.length === 0) {
        this.stopModule(currentModules, 1);

        this.currentModuleName = moduleName;
        this.startModule(newModules);
      }
      else {
        // We assume that common modules are always at the start.
        if (currentModules.length > commonModules.length) {
          this.stopModule(currentModules, commonModules.length + 1);
        }
        this.currentModuleName = moduleName;
        if (newModules.length > commonModules.length) {
          this.startModule(newModules, commonModules.length + 1);
        }
      }

    }
  },

  render: function (path) {
    var args = _.toArray(arguments);
    args = _.rest(args);
    var module = this.module(path.getModuleName());
    _.callMethod(module.render, module, [path, this.mainLayout.regions.content, args]);
  },

  onStart: function () {
    var self = this;

    $(document).on("ajaxError", function (e, xhr) {
      if (xhr.status === 403) {
        var route = xhr.getResponseHeader('Location');
        if (route) { route = route.substring(1); }
        else { route = 'login';}
        self.authentication.logout(function () {
          messageBus.command('route:login');
        });
      }
    });

    messageBus.comply('navigate', this.navigate, this);
    messageBus.comply('log', function () {
      /* global console */
      var args = _.flatten([
        moment().format(),
        Array.prototype.slice.call(arguments)
      ]);
      if (console) {
        console.log.apply(console, args);
      }
    });

    this.mainLayout.show();
    this.navbarModule.start();
    this.navbarModule.show(this.mainLayout.regions.navbar);
    this.setModule('homepage');

    this.authentication.isAuthenticated(function () {
      if (Backbone.history) {
        Backbone.history.start({
          silent: false
        });

        if (self.getCurrentRoute() === '') {
          messageBus.command('route:home');
        }
      }
    });
  }

});

module.exports = BboFansApp;
