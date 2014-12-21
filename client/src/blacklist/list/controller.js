var Marionette = require('backbone.marionette');

var View = require('./view');
var Blacklist = require('../models/blacklist');

var Impl = function (options) {
  var self = this;
  var viewFactory = {};

  /*
   * User wants to add a member.
   *
   * This is done by navigating to a route.
  */
  function newBlacklist(id) {
    self.app.vent.trigger('route:admin/blacklist/new', id);
  }

  /*
   * User wants to edit a member.
   *
   * This is done by navigating to a route.
   *
   * @param id {String} unique id of the member to edit.
    */
  function editBlacklist(id) {
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
    this.view.on('blacklist:add', newBlacklist);

    this.app.vent.on('blacklist:changed', function  () {
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
