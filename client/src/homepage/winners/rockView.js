/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');

var WinnersView = Marionette.ItemView.extend({
  template: require('./rock.hbs')
});

module.exports = WinnersView;
