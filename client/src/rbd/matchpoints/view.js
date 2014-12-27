var Marionette = require('backbone.marionette');

var RbdMatchpointsView = Marionette.ItemView.extend({
  template: require('./template.hbs'),
  className: 'well',

  ui: {
    table: "table"
  },

  onRender: function(){
    this.ui.table.bootstrapTable();
  }
});

module.exports = RbdMatchpointsView;
