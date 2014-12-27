var Backbone = require('backbone');

var NavbarMenuModel = Backbone.Model.extend();
var NavbarMenuCollection = Backbone.Collection.extend({
  model: NavbarMenuModel
});

module.exports = NavbarMenuCollection;
