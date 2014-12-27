var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var $ = require('jquery');

var MemberListView = require('./view');
var Member = require('../../common/models/member');
var MemberCommandsNoSelectionView = require('../commands/noSelectionView');
var MemberCommandsFlagView = require('../commands/flagView');
var MemberCommandsEmailView = require('../commands/emailView');
var MemberCommandsBlacklistView = require('../commands/blacklistView');
var MemberCommandsInvalidCommandView = require('../commands/invalidCommandView');

var FlagCommands = require('../models/flagCommands');
var EmailCommand = require('../models/emailCommand');
var BlacklistCommand = require('../models/blacklistCommand');

var MemberListControllerImpl = function (options) {
  var self = this;
  var viewFactory = {};

  /*
   * Factory for creating views for a given command.
   *
   * <code>
   * var popupView = viewFactory[command](rows);
   * popupRegion.show(popupView);
   * $('#popupId').modal('show');
   * </code>
   */
  $.each(['validate', 'enable', 'disable'], function (i, cmd) {
    viewFactory[cmd] = function (rows) {
      var title = cmd[0].toUpperCase() + cmd.substring(1);
      return new MemberCommandsFlagView( {
        model: new Backbone.Model({
          command: cmd,
          rows: rows,
          buttonTitle: title
        })
      });
    };
  });
  viewFactory.email = function (rows) {
    return new MemberCommandsEmailView( {
      template: require('../commands/email.hbs'),
      model: new Backbone.Model({
        command: 'email',
        rows: rows,
        buttonTitle: 'Send'
      })
    });
  };
  viewFactory.blacklist = function (rows) {
    return new MemberCommandsBlacklistView( {
      model: new Backbone.Model({
        command: 'blacklist',
        rows: rows,
        buttonTitle: 'Add to blacklist'
      })
    });
  };
  viewFactory.whitelist = function (rows) {
    return new MemberCommandsBlacklistView( {
      model: new Backbone.Model({
        command: 'whitelist',
        rows: rows,
        buttonTitle: 'Remove from blacklist'
      })
    });
  };

  /*
   * Create (popup) view for the given command and rows.
   */
  function createView(command, rows) {
    if (rows.length === 0) {
      return new MemberCommandsNoSelectionView( {
        model: new Backbone.Model({ command: command })
      });
    }

    if (viewFactory[command]) {
      return viewFactory[command](rows);
    }

    return new MemberCommandsInvalidCommandView( {
      model: new Backbone.Model({ command: command })
    });
  }

  /*
   * User wants to execute a bulk command on selected users.
   *
   * This is handled through a popup.
   */
  function executeCommand(command, rows) {
    var popupView = createView(command, rows);
    self.popup.show(popupView);
    var $popup = $('#popupModal');
    $popup.modal('show');

    popupView.on('command:execute', function (data) {
      var xhr = null;
      var model = null;

      if (data.command === 'email') {
        model = new EmailCommand();
        xhr = model.save({rows: data.rows, subject: data.subject, message: data.message});
      }
      else if (data.command === 'blacklist' || data.command === 'whitelist') {
        model = new BlacklistCommand();
        xhr = model.save({rows: data.rows, from: data.from, for: data.for, reason: data.reason});
      }
      else {
        model = new FlagCommands[data.command]();
        xhr = model.save({rows: data.rows});
      }

      if (xhr === false) {
        console.log("fail", xhr);
        if (data.command === 'email' || data.command === 'blacklist' || data.command === 'whitelist') {
          popupView.triggerMethod("form:data:invalid", model.validationError);
        }
        else {
          $popup.modal('hide');
        }
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
  }

  /*
   * User wants to edit a member.
   *
   * This is done by navigating to a route.
   *
   * @param id {String} unique id of the member to edit.
    */
  function editMember(id) {
    self.app.vent.trigger('route:admin/member/:id', id);
  }

  /*
   * Public methods.
   */

  /**
   * Create and show the view.
   */
  this.show = function () {
    var member = new Member();
    
    this.view = new MemberListView({
      model: member
    });

    this.view.on('members:edit', editMember);

    this.view.on('members:command', executeCommand);

    this.app.vent.on('members:changed', function  () {
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

  this.app.commands.setHandler('admin:member:show', function () {
    self.show();
  });
};

var MemberListController = Marionette.Controller.extend({
  initialize: function (options) {
    this.impl = new MemberListControllerImpl(options);
  },

  show: function () {
    this.impl.show();
  }
});

module.exports = MemberListController;
