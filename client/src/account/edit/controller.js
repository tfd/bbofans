/* jshint -W097 */
"use strict";

var Marionette = require('backbone.marionette');
var messageBus = require('../../common/router/messageBus');
var _ = require('underscore');

var AdminAccountEditView = require('./view');
var Account = require('../../models/account');

function addToArray(data, fieldName) {
  var pluralFieldName = fieldName + 's';
  if (data[fieldName]) {
    var arr = [];
    _.each(data[fieldName], function (val) {
      if (val) {
        arr.push(val);
      }
    });
    if (!_.isEmpty(arr)) {
      data[pluralFieldName] = arr;
    }
    delete data[fieldName];
  }
}

var AdminAccountEditController = Marionette.Controller.extend({
  initialize: function (options) {
    this.app = options.app;
    this.module = options.module;
  },

  show: function (region, id) {
    var accountToFetch = new Account({_id: id});
    accountToFetch.fetch().done(function (model) {
      var account = new Account(model);
      var editView = new AdminAccountEditView({
        model: account
      });

      editView.on('form:submit', function (data) {
        addToArray(data, 'email');
        addToArray(data, 'telephone');

        var xhr = account.save(data);
        if (xhr === false) {
          editView.triggerMethod("form:data:invalid", account.validationError);
        }
        else {
          xhr.done(function (data) {
            messageBus.trigger("route:admin/account/:id", account.get("_id"));
          }).fail(function (xhr) {
            editView.triggerMethod("form:data:invalid", xhr.responseJSON);
          });
        }
      });

      editView.on('form:cancel', function () {
        messageBus.trigger("route:admin/account/:id", account.get("_id"));
      });

      region.show(editView);
    });
  }
});

module.exports = AdminAccountEditController;
