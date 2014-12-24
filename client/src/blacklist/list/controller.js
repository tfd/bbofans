var Marionette = require('backbone.marionette');
var View = require('./view');
var DurationEntry = require('../models/durationEntry');
var NewBlacklistView = require('../new/view.js');
var $ = require('jquery');
var moment = require('moment');

var Impl = function (options) {
  var self = this;
  var viewFactory = {};

  /*
   * User wants to add a new member.
   *
   * This is done with a popup window.
   */
  function newBlacklist () {
    var durationEntry = new DurationEntry({
      bboName: '',
      from: moment.utc(),
      for: '1w',
      reason: ''
    });
    var popupView = new NewBlacklistView({model: durationEntry});
    self.popup.show(popupView);
    var $popup = $('#popupModal');
    $popup.modal('show');

    popupView.on('form:submit', function (data) {
      var xhr = null;
      xhr = durationEntry.save(data);

      if (xhr === false) {
        console.log("fail", xhr);
        popupView.triggerMethod("form:data:invalid", durationEntry.validationError);
      }
      else {
        xhr.done(function (data) {
          self.view.reloadTable();
        }).fail(function (xhr) {
          console.log("fail", xhr.responseJSON);
        });
        $popup.modal('hide');
      }
    });

    popupView.on('form:cancel', function () {
      $popup.modal('hide');
    });
  }

  /*
   * User wants to edit a member.
   *
   * This is done by navigating to a route.
   *
   * @param id {String} unique id of the member to edit.
   */
  function editBlacklist (id) {
    self.app.vent.trigger('route:admin/blacklist/:id', id);
  }

  /*
   * Public methods.
   */

  /**
   * Create and show the view.
   */
  this.show = function () {
    var member = new Member();

    this.view = new View({
      model: member
    });

    this.view.on('blacklist:edit', editBlacklist);
    this.view.on('blacklist:new', newBlacklist);

    this.app.vent.on('blacklist:changed', function () {
      self.view.reloadTable();
    });

    this.region.show(this.view);
  };

  /*
   * Everything is in place, startup the controller.
   */

  this.region = options.region;
  this.popup = options.popup;
  this.app = options.app;

  this.app.commands.setHandler('admin:blacklist:show', function () {
    self.show();
  });
};

var MembersController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new Impl(options);
  },

  show: function () {
    this.impl.show();
  }
});

module.exports = MembersController;
