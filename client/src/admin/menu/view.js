var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var $ = require('jquery');

var AdminMenuView = Backbone.Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    'menuItem': 'a.list-group-item'
  },

  events: {
    'click a.list-group-item': 'navigate'
  },

  navigate: function (e) {
    var $el = $(e.currentTarget);
    e.preventDefault();
    $('#admin-menu-accordion a.active').removeClass('active');
    $el.addClass('active');
    this.trigger('navigate', $el.attr('href').substr(1));
  }
});

module.exports = AdminMenuView;
