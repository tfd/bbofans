/* jshint -W097 */
"use strict";

var messageBus = require('../common/router/messageBus');
var Handlebars = require("hbsfy/runtime");
var $ = require('jquery');
var _ = require('underscore');

var User = require('../models/user');

var authentication = {
  checking: true,

  login: function (username, password, cb) {
    var self = this;
    cb = cb || _.noop;

    this.checking = true;
    $.ajax({
      type: 'POST',
      url : '/admin/session',
      data: {
        username: username,
        password: password
      }
    }).done(function (rsp) {
      if (rsp.error) {
        self.user = null;
        cb({'username': "Invalid username or password"}, null);
      }
      else {
        self.user = new User(rsp.user);
        cb(null, self.user);
      }
      self.checking = false;
      messageBus.trigger('authenticated');
    });
  },

  logout: function (cb) {
    cb = cb || _.noop;

    delete this.user;
    $.ajax({url: '/admin/logout'}).complete(function () {
      cb();
    });
  },

  isAuthenticated: function (cb) {
    var self = this;
    cb = cb || _.noop;

    if (this.checking) {
      messageBus.on('authenticated', _.once(function () {
        cb(self.user !== undefined);
      }));
    }
    else {
      cb(this.user !== undefined);
    }
  },

  getUser: function () {
    return this.user;
  }

};

/**
 * Register a handlebars helper that can be used in the following way:
 *
 * {{#authentication}}
 *   {{#if @user.isMemberManager}}
 *     User can manage members.
 *   {{/if}}
 * {{/authentication}}
 */
Handlebars.registerHelper('authentication', function(options) {
  var data = Handlebars.createFrame(options.data || {});
  data.user = authentication.getUser().toJSON();
  return options.fn(this, { data: data });
});

$.ajax({
  type: 'GET',
  url : '/admin/session'
}).done(function (rsp) {
  if (!rsp.error) {
    authentication.user = new User(rsp);
  }
  authentication.checking = false;
  messageBus.trigger('authenticated');
});

module.exports = authentication;
