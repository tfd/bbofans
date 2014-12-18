var Backbone = require('backbone');
var Entry = require('./entry');

EntryCollection = Backbone.Collection.extend({
  model: Entry
});

module.exports = EntryCollection;
