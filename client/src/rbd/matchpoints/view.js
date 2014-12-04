var Marionette = require('backbone.marionette');

var MatchpointsView = Marionette.ItemView.extend({
  template: require('./template.hbs'),

  ui: {
    table: "table"
  },

  onRender: function(){
    this.ui.table.bootstrapTable();
  }
});

module.exports = MatchpointsView;
