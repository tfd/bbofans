var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var $ = require('jquery');
var Moment = require('moment');

var EditBlacklistView = require('./view');
var Blacklist = require('../models/blacklist');

var Impl = function (options) {
  var self = this;

  function back() {
    var fragment = Backbone.history.fragment;
    var parts = fragment.split('/');
    var route = parts.slice(0, parts.length - 1).join('/');
    self.app.vent.trigger('route:' + route);
  }

  function save(blacklist, data) {
    var xhr = blacklist.save(data);
    if (xhr === false) {
      registerView.triggerMethod("form:data:invalid", blacklist.validationError);
    }
    else {
      xhr.done(function (data) {
        back();
        self.app.vent.trigger('blacklist:changed', data);
      }).fail(function (xhr) {
        console.log("fail", xhr.responseJSON);
        view.triggerMethod("form:data:invalid", xhr.responseJSON);
      });
    }
  }

  function show(model) {
    model.entries.forEach(function (val, i) {
      delete val.from;
      delete val.to;
    });
    var blacklist = new Blacklist(model);
    var view = new EditBlacklistView({
      model: blacklist,
      collection: blacklist.get('entries')
    });

    view.on('form:submit', function (data) {
      save(blacklist, data);
    });

    view.on('form:cancel', function () {
      back();
    });

    self.region.show(view);
  }

  this.region = options.region;
  this.app = options.app;

  this.app.commands.setHandler('admin:blacklist:edit:show', function (id) {
    var blacklist = new Blacklist({ _id : id });
    blacklist.fetch().done(show);
  });
};

var EditBlacklistController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new Impl(options);
  }
});

module.exports = EditBlacklistController;
