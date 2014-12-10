var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var $ = require('jquery');

var MenuView = Backbone.Marionette.ItemView.extend({
  template: require('./template.hbs'),

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

module.exports = MenuView;
