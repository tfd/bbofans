var Marionette = require('backbone.marionette');

var SuccessView = Marionette.ItemView.extend({
  tag: 'div',
  className: 'well',

  template: require('./successTemplate.hbs')
});

module.exports = SuccessView;
