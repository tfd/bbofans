var Marionette = require('backbone.marionette');
var messageBus = require('../../common/utils/messageBus');

var homepageHomeTemplate = require('./home.hbs');
var homepageRulesTemplate = require('./rules.hbs');
var homepageAwardsTemplate = require('./awards.hbs');
var homepageMathPointsTemplate = require('./matchpoints.hbs');
var homepageBboLinksTemplate = require('./bbolinks.hbs');
var createStaticView = require('../../common/views/staticContent');

var HomepagePageController = Marionette.Controller.extend({
  initialize: function (options) {
    var self = this;
    
    this.app = options.app;
    this.module = options.module;
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
  }
});

module.exports = HomepagePageController;
