var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var moment = require('moment');
var messageBus = require('../../common/utils/messageBus');

var Layout = require('./layout');
var View = require('../details/view');
var Form = require('../add/view');
var Blacklist = require('../../models/blacklist');
var DurationEntry = require('../../models/blacklistDurationEntry');

var BlacklistEditImpl = function (options) {
  var self = this;

  function back() {
    var fragment = Backbone.history.fragment;
    var parts = fragment.split('/');
    var route = parts.slice(0, parts.length - 1).join('/');
    messageBus.command('route:' + route);
  }

  function save(entry, data) {
    var xhr = entry.save(data);
    if (xhr === false) {
      self.form.triggerMethod("form:data:invalid", entry.validationError);
    }
    else {
      xhr.done(function (data) {
        back();
        messageBus.trigger('blacklist:entry:changed', data);
      }).fail(function (xhr) {
        console.log("fail", xhr.responseJSON);
        self.form.triggerMethod("form:data:invalid", xhr.responseJSON);
      });
    }
  }

  function show(region, model) {
    var blacklist = new Blacklist(model);
    var durationEntry = new DurationEntry({
      bboName: blacklist.get('bboName'),
      'from': moment.utc().toDate(),
      'for': '1w'
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

    region.show(self.layout);
    self.layout.view.show(self.view);
    self.layout.form.show(self.form);
  }

  this.show = function (region, id) {
    var blacklist = new Blacklist({ _id : id });
    blacklist.fetch().done(function (model) {
      show(region, model);
    });
  };

  this.app = options.app;
  this.model = options.model;
};

var BlacklistEditController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new BlacklistEditImpl(options);
  },

  show: function (region, id) {
    this.impl.show(region, id);
  }
});

module.exports = BlacklistEditController;
