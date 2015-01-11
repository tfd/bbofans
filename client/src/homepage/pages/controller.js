/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');

var homepageServerErrorTemplate = require('./serverError.hbs');
var homepagePageNotFoundTemplate = require('./pageNotFound.hbs');
var homepageHomeTemplate = require('./home.hbs');
var homepageRulesTemplate = require('./rules.hbs');
var homepageAwardsTemplate = require('./awards.hbs');
var homepageMathPointsTemplate = require('./matchpoints.hbs');
var homepageBboLinksTemplate = require('./bbolinks.hbs');
var homepageConfirmRegistrationTemplate = require('./confirmRegistration.hbs');
var createStaticView = require('../../common/views/staticContent');

var HomepagePageController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  showServerError: function (region) {
    region.show(createStaticView(homepageServerErrorTemplate));

    messageBus.command('show:winners:rock');
  },

  showPageNotFound: function (region) {
    region.show(createStaticView(homepagePageNotFoundTemplate));

    messageBus.command('show:winners:rock');
  },

  showHome: function (region) {
    region.show(createStaticView(homepageHomeTemplate));

    messageBus.command('show:winners:rock');
  },

  showRules: function (region) {
    region.show(createStaticView(homepageRulesTemplate));

    messageBus.command('show:winners:rock');
  },

  showAwards: function (region) {
    region.show(createStaticView(homepageAwardsTemplate));

    messageBus.command('show:winners:rock');
  },

  showMatchPoints: function (region) {
    region.show(createStaticView(homepageMathPointsTemplate));

    messageBus.command('show:winners:rock');
  },

  showBboLinks: function (region) {
    region.show(createStaticView(homepageBboLinksTemplate));

    messageBus.command('show:winners:rock');
  },

  showConfirmRegistration: function (region) {
    region.show(createStaticView(homepageConfirmRegistrationTemplate));

    messageBus.command('show:winners:rock');
  }
});

module.exports = HomepagePageController;
