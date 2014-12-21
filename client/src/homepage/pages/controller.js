var Marionette = require('backbone.marionette');
var bbofansApp = require('../../bbofans');

var homeTemplate = require('./home.hbs');
var rulesTemplate = require('./rules.hbs');
var awardsTemplate = require('./awards.hbs');
var mathpointsTemplate = require('./matchpoints.hbs');
var bboLinksTemplate = require('./bbolinks.hbs');
var StaticView = require('../../common/views/staticContent');

var PageController = Marionette.Controller.extend({
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
    this.region.show(StaticView(homeTemplate));
  },

  showRules: function () {
    this.region.show(StaticView(rulesTemplate));
  },

  showAwards: function () {
    this.region.show(StaticView(awardsTemplate));
  },

  showMatchpoints: function () {
    this.region.show(StaticView(mathpointsTemplate));
  },

  showBboLinks: function () {
    this.region.show(StaticView(bboLinksTemplate));
  }
});

module.exports = PageController;
