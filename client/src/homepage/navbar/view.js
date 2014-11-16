var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var $ = require('jquery');
var bbofansApp = require('../../bbofans');

var NavBarView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  events: {
    'click a.menu-item': 'navigate'
  },

  navigate: function (e) {
    var $el = $(e.currentTarget);
    e.preventDefault();
    $('#navbar li.active').removeClass('active');
    $el.parent('li').addClass('active');
    $el.parents('li.dropdown').addClass('active');
    this.trigger('navigate', $el.attr('data-trigger'));
  }
});

module.exports = NavBarView;
