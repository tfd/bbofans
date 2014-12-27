var Marionette = require('backbone.marionette');
var bbofansApp = require('../../bbofans');

var homepageHomeTemplate = require('./home.hbs');
var homepageRulesTemplate = require('./rules.hbs');
var homepageAwardsTemplate = require('./awards.hbs');
var homepageMathpointsTemplate = require('./matchpoints.hbs');
var homepageBboLinksTemplate = require('./bbolinks.hbs');
var HomepageStaticView = require('../../common/views/staticContent');

var HomepagePageController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.region = options.region;
    this.app = options.app;

    this.app.commands.setHandler('home:show', function () {
      self.showHome();
    });
    this.app.commands.setHandler('rules:show', function () {
      self.showRules();
    });
    this.app.commands.setHandler('awards:show', function () {
      self.showAwards();
    });
    this.app.commands.setHandler('matchpoints:show', function () {
      self.showMatchpoints();
    });
    this.app.commands.setHandler('bbolinks:show', function () {
      self.showBboLinks();
    });
  },

  showHome: function () {
    this.region.show(HomepageStaticView(homepageHomeTemplate));
  },

  showRules: function () {
    this.region.show(HomepageStaticView(homepageRulesTemplate));
  },

  showAwards: function () {
    this.region.show(HomepageStaticView(homepageAwardsTemplate));
  },

  showMatchpoints: function () {
    this.region.show(HomepageStaticView(homepageMathpointsTemplate));
  },

  showBboLinks: function () {
    this.region.show(HomepageStaticView(homepageBboLinksTemplate));
  }
});

module.exports = HomepagePageController;
