var messageBus = require('../common/utils/messageBus');
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
      messageBus.on('authenticated', function () {
        cb(self.user !== undefined);
      });
    }
    else {
      cb(this.user !== undefined);
    }
  },

  getUser: function () {
    return this.user;
  }

};

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
