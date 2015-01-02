var Marionette = require('backbone.marionette');

module.exports = function (templateName) {
  var StaticView = Marionette.ItemView.extend({
    template: templateName
  });

  return new StaticView();
};
