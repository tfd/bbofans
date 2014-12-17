var Backbone = require('backbone');

FlagCommand = Backbone.Model.extend({
  urlRoot: 'amin/commands/email',
  idAttribute: "_id",
  
  defaults: {
    rows: [],
    subject: '',
    message: ''
  }

});

module.exports = FlagCommand;
