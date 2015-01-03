/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

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
  },

  showPageNotFound: function (region) {
    region.show(createStaticView(homepagePageNotFoundTemplate));
  },

  showHome: function (region) {
    region.show(createStaticView(homepageHomeTemplate));
  },

  showRules: function (region) {
    region.show(createStaticView(homepageRulesTemplate));
  },

  showAwards: function (region) {
    region.show(createStaticView(homepageAwardsTemplate));
  },

  showMatchPoints: function (region) {
    region.show(createStaticView(homepageMathPointsTemplate));
  },

  showBboLinks: function (region) {
    region.show(createStaticView(homepageBboLinksTemplate));
  },

  showConfirmRegistration: function (region) {
    region.show(createStaticView(homepageConfirmRegistrationTemplate));
  }
});

module.exports = HomepagePageController;
