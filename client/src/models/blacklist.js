/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var BlacklistEntryCollection = require('./blacklistEntryCollection');
var $ = require('jquery');

var Blacklist = Backbone.Model.extend({
  urlRoot: 'admin/blacklist',
  idAttribute: '_id',
  
  defaults: {
    td: '',
    bboName: '',
    entries: new BlacklistEntryCollection()
  },

  set: function(attributes, options) {
    if (attributes.entries !== undefined && !(attributes.entries instanceof BlacklistEntryCollection)) {
        attributes.entries = new BlacklistEntryCollection(attributes.entries);
    }
    return Backbone.Model.prototype.set.call(this, attributes, options);
  },

  fetchByBboName: function () { 
    return this.fetch({ url: 'admin/blacklist/bboName', data : $.param( { bboName : this.get('bboName') }) });
  }
});

module.exports = Blacklist;
