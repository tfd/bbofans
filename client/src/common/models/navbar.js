var Backbone = require('backbone');

var MenuModel = Backbone.Model.extend();
var MenuCollection = Backbone.Collection.extend({
  model: MenuModel
});

module.exports = MenuCollection;
