/* jshint -W097 */
"use strict";

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');
var _ = require('underscore');

var MemberCommandsNoSelectionView = require('../commands/noSelectionView');
var MemberCommandsFlagView = require('../commands/flagView');
var MemberCommandsEmailView = require('../commands/emailView');
var MemberCommandsBlacklistView = require('../commands/blacklistView');
var MemberCommandsInvalidCommandView = require('../commands/invalidCommandView');

var FlagCommands = require('../../models/flagCommands');
var EmailCommand = require('../../models/emailCommand');
var BlacklistCommand = require('../../models/blacklistCommand');
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
_.each(['validate', 'enable', 'disable'], function (cmd) {
  viewFactory[cmd] = function (rows) {
    var buttonTitle = cmd[0].toUpperCase() + cmd.substring(1);
    var title = buttonTitle + ' members';
    return new MemberCommandsFlagView( {
      model: new Backbone.Model({
        command: cmd,
        rows: rows,
        title: title,
        buttonTitle: buttonTitle
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
      title: 'Send emails',
      buttonTitle: 'Send'
    })
  });
};
viewFactory.blacklist = function (rows) {
  return new MemberCommandsBlacklistView( {
    model: new Backbone.Model({
      command: 'blacklist',
      rows: rows,
      title: 'Add members from blacklist',
      buttonTitle: 'Add to blacklist'
    })
  });
};
viewFactory.whitelist = function (rows) {
  return new MemberCommandsBlacklistView( {
    model: new Backbone.Model({
      command: 'whitelist',
      rows: rows,
      title: 'Remove members from blacklist',
      buttonTitle: 'Remove from blacklist'
    })
  });
};

/*
 * Create (popup) view for the given command and rows.
 */
function createView(command, members) {
  if (members.length === 0) {
    return new MemberCommandsNoSelectionView( {
      model: new Backbone.Model({ command: command })
    });
  }

  if (viewFactory[command]) {
    return viewFactory[command](members);
  }

  return new MemberCommandsInvalidCommandView( {
    model: new Backbone.Model({ command: command })
  });
}

var CommandsController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region, command, members) {
    var self = this;
    var popupView = createView(command, members);
    region.show(popupView);
    this.app.showPopup();

    popupView.on('form:submit', function (data) {
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
        if (data.command === 'email' || data.command === 'blacklist' || data.command === 'whitelist') {
          popupView.triggerMethod("form:data:invalid", model.validationError);
        }
        else {
          self.app.hidePopup();
        }
      }
      else {
        xhr.done(function (data) {
          messageBus.trigger('members:changed', data);
        }).fail(function (xhr) {
          messageBus.command('log', "fail", xhr.responseJSON);
        });
        self.app.hidePopup();
      }
    });

    popupView.on('form:cancel', function () {
      self.app.hidePopup();
    });
  }
});

module.exports = CommandsController;
