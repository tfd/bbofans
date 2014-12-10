var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var $ = require('jquery');

var NavbarItemView = Backbone.Marionette.ItemView.extend({
  tagName: 'li',
  template: require('./item.hbs')
});

var NavbarView = Backbone.Marionette.CompositeView.extend({
  template: require('./template.hbs'),

  childViewContainer: 'ul.dropdown-menu',
  childView: NavbarItemView,

  events: {
    'click a.menu-item': 'navigate'
  },

  navigate: function (e) {
    var $el = $(e.currentTarget);
    e.preventDefault();
    $('#navbar li.active').removeClass('active');
    $el.parent('li').addClass('active');
    $el.parents('li.dropdown').addClass('active');
    this.trigger('navigate', $el.attr('href').substr(1));
  }
});

module.exports = NavbarView;
