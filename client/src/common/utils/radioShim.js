/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var _ = require('underscore');

Marionette.Application.prototype._initChannel = function () {
  this.channelName = _.result(this, 'channelName') || 'global';
  this.channel = _.result(this, 'channel') || Radio.channel(this.channelName);
};
