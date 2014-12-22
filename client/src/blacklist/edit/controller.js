var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');

var Layout = require('./layout');
var View = require('../details/view');
var Form = require('../add/view');
var Blacklist = require('../models/blacklist');
var DurationEntry = require('../models/durationEntry');

var Impl = function (options) {
  var self = this;

  function back() {
    var fragment = Backbone.history.fragment;
    var parts = fragment.split('/');
    var route = parts.slice(0, parts.length - 1).join('/');
    self.app.vent.trigger('route:' + route);
  }

  function save(entry, data) {
    var xhr = entry.save(data);
    if (xhr === false) {
      self.form.triggerMethod("form:data:invalid", entry.validationError);
    }
    else {
      xhr.done(function (data) {
        back();
        self.app.vent.trigger('entry:changed', data);
      }).fail(function (xhr) {
        console.log("fail", xhr.responseJSON);
        self.form.triggerMethod("form:data:invalid", xhr.responseJSON);
      });
    }
  }

  function show(model) {
    var blacklist = new Blacklist(model);
    var durationEntry = new DurationEntry({
      bboName: blacklist.get('bboName'),
      'from': moment.utc().toDate(),
      'for': '1W'
    });

    self.layout = new Layout();
    self.view = new View({
      model: blacklist
    });
    self.form = new Form({
      model: durationEntry
    });

    self.form.on('form:submit', function (data) {
      save(durationEntry, data);
    });

    self.form.on('form:cancel', function () {
      back();
    });

    self.region.show(self.layout);
    self.layout.view.show(self.view);
    self.layout.form.show(self.form);
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
