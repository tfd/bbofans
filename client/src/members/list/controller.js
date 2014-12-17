var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var $ = require('jquery');

var View = require('./view');
var Member = require('../../common/models/member');
var NoSelectionView = require('./noSelectionView');
var FlagView = require('./flagView');
var EmailView = require('./emailView');
var InvalidCommandView = require('./invalidCommandView');

var FlagCommands = require('../../common/models/flagCommands');
var EmailCommand = require('../../common/models/emailCommand');

var Impl = function (options) {
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
  $.each(['validate', 'enable', 'disable', 'blacklist', 'whitelist', 'ban', 'unban'], function (i, cmd) {
    viewFactory[cmd] = function (rows) {
      var title = cmd[0].toUpperCase() + cmd.substring(1);
      return new FlagView( {
        model: new Backbone.Model({
          command: cmd,
          rows: rows,
          buttonTitle: title
        })
      });
    };
  });
  viewFactory.email = function (rows) {
    return new EmailView( {
      model: new Backbone.Model({
        command: 'email',
        rows: rows,
        buttonTitle: 'Send'
      })
    });
  };

  /*
   * Create (popup) view for the given command and rows.
   */
  function createView(command, rows) {
    if (rows.length === 0) {
      return new NoSelectionView( {
        model: new Backbone.Model({ command: command })
      });
    }
    else if (viewFactory[command]) {
      return viewFactory[command](rows);
    }
    else {
      return new InvalidCommandView( {
        model: new Backbone.Model({ command: command })
      });
    }
  }

  /*
   * User wants to execute a bulk command on selected users.
   *
   * This is handled through a popup.
   */
  function executeCommand(command, rows) {
    var popupView = createView(command, rows);
    self.popup.show(popupView);
    $('#popupModal').modal('show');

    popupView.on('command:execute', function (data) {
      if (data.command === 'email') {
        var email = new EmailCommand();
        email.save({rows: data.rows, subject: data.subject, message: data.message});
      }
      else {
        var flag = new FlagCommands[data.command]();
        var xhr = flag.save({rows: data.rows});
        if (xhr === false) {
          console.log("fail", xhr);
        }
        else {
          xhr.done(function (data) {
            self.view.reloadTable();
          }).fail(function (xhr) {
            console.log("fail", xhr.responseJSON);
          });
        }
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
    self.app.vent.trigger('route:admin/members/:id', id);
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

  this.app.commands.setHandler('admin:members:show', function () {
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
