var Backbone = require('backbone');

var TdModel = Backbone.Model.extend();
var TdCollection = Backbone.Collection.extend({
  model: TdModel
});

module.exports = TdCollection;
