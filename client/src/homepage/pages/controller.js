/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');

var homepageServerErrorTemplate = require('./serverError.hbs');
var homepagePageNotFoundTemplate = require('./pageNotFound.hbs');
var homepageAboutTemplate = require('./about.hbs');
var homepageRulesTemplate = require('./rules.hbs');
var homepageAwardsTemplate = require('./awards.hbs');
var homepageMathPointsTemplate = require('./matchpoints.hbs');
var homepageBboLinksTemplate = require('./bbolinks.hbs');
var homepageConfirmRegistrationTemplate = require('./confirmRegistration.hbs');
var homepagePasswordResetTemplate = require('./passwordReset.hbs');
var createStaticView = require('../../common/views/staticContent');

var HomepagePageController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  showServerError: function (region) {
    region.show(createStaticView(homepageServerErrorTemplate));

    messageBus.command('hide:winners');
  },

  showPageNotFound: function (region) {
    region.show(createStaticView(homepagePageNotFoundTemplate));

    messageBus.command('hide:winners');
  },

  showAbout: function (region) {
    region.show(createStaticView(homepageAboutTemplate));

    messageBus.command('hide:winners');
  },

  showRules: function (region) {
    region.show(createStaticView(homepageRulesTemplate));

    messageBus.command('hide:winners');
  },

  showAwards: function (region) {
    region.show(createStaticView(homepageAwardsTemplate));

    messageBus.command('hide:winners');
  },

  showMatchPoints: function (region) {
    region.show(createStaticView(homepageMathPointsTemplate));

    messageBus.command('hide:winners');
  },

  showBboLinks: function (region) {
    region.show(createStaticView(homepageBboLinksTemplate));

    messageBus.command('hide:winners');
  },

  showConfirmRegistration: function (region) {
    region.show(createStaticView(homepageConfirmRegistrationTemplate));

    messageBus.command('hide:winners');
  },

  showPasswordReset: function (region) {
    region.show(createStaticView(homepagePasswordResetTemplate));

    messageBus.command('hide:winners');
  }
});

module.exports = HomepagePageController;
