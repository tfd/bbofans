/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var Form = require('../form/view');

var BlacklistAddLayoutView = Marionette.LayoutView.extend({
  template: require('./template.hbs'),

  regions: {
    'form': '#blacklist-form'
  },

  onRender: function () {
    var self = this;

    this.model.set('blacklisting', 'blacklisting');
    this.model.set('createLabel', 'Add to blacklist');
    this.formView = new Form({
      model: this.model
    });

    this.formView.on('form:submit', function (data) {
      self.triggerMethod('form:submit', data);
    });

    this.formView.on('form:cancel', function () {
      self.triggerMethod('form:cancel');
    });

    this.formView.on('form:close', function () {
      self.triggerMethod('form:close');
    });

    this.form.show(this.formView);
  }
});

module.exports = BlacklistAddLayoutView;
