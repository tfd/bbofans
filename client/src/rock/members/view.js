var Marionette = require('backbone.marionette');

var MembersView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    table: "table"
  },

  onRender: function(){
    this.ui.table.bootstrapTable();
  }
});

module.exports = MembersView;
