/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');

var HomepageCarouselView = require('./view');

var HomepageTdCarouselController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region) {
    this.view = new HomepageCarouselView();
    this.view.model.set('items', messageBus.request('tds.carousel'));
    region.show(this.view);
  }

});

module.exports = HomepageTdCarouselController;
