var Backbone = require('backbone');
var EntryCollection = require('./entryCollection');

Blacklist = Backbone.Model.extend({
  urlRoot: "admin/blacklist",
  idAttribute: "_id",
  
  defaults: {
    bboName: "",
    entries: new EntryCollection()
  },

  set: function(attributes, options) {
    if (attributes.entries !== undefined && !(attributes.entries instanceof EntryCollection)) {
        attributes.entries = new EntryCollection(attributes.entries);
    }
    return Backbone.Model.prototype.set.call(this, attributes, options);
  }
});

module.exports = Blacklist;
