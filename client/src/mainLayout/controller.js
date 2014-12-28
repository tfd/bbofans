var Marionette = require('backbone.marionette');
var MainLayoutView = require('./view');
var $ = require('jquery');

var MainLayoutController = Marionette.Controller.extend({
  initialize: function (options) {
    this.view = new MainLayoutView(options);

    this.regions = {
      content: this.view.content,
      navbar : this.view.navbar,
      popup  : this.view.popup
    };
  },

  show: function () {
    this.view.render();
  },

  showPopup: function () {
    $('#popupModal').modal('show');
  },

  hidePopup: function () {
    $('#popupModal').modal('hide');
  }
});

module.exports = MainLayoutController;
