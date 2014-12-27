var Marionette = require('backbone.marionette');

var RockMembersView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    table: "table"
  },

  onRender: function(){
    this.ui.table.bootstrapTable();
  }
});

module.exports = RockMembersView;
