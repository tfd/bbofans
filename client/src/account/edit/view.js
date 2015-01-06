/* jshint -W097 */
"use strict";

var FormWithErrorHandling = require('../../common/views/formWithErrorHandling');
var $ = require('jquery');

var AccountView = FormWithErrorHandling.extend({
  template : require('./template.hbs'),
  tag      : 'div',
  className: 'well',
  idPrefix : 'account',

  ui: FormWithErrorHandling.extendUi({
    'reset'          : '.form-reset',
    'nation'         : '#account-nation',
    'level'          : '#account-level',
    'addEmail'       : '#account-add-email',
    'addTelephone'   : '#account-add-telephone',
    'removeEmail'    : '.account-remove-email',
    'removeTelephone': '.account-remove-telephone'
  }),

  events: FormWithErrorHandling.extendEvents({
    'click @ui.reset'          : 'resetClicked',
    'click @ui.addEmail'       : 'addEmailClicked',
    'click @ui.addTelephone'   : 'addTelephoneClicked',
    'click @ui.removeEmail'    : 'removeElementClicked',
    'click @ui.removeTelephone': 'removeElementClicked'
  }),

  resetClicked: function (e) {
    e.preventDefault();
    this.render();
  },

  addEmailClicked: function () {
    var index = $('.account-email').length;
    var $inputGroup = $('<div>').addClass('input-group');
    var $input = $('<input type="email">').attr({
      'name'       : 'email[' + index + ']',
      'width'      : '20',
      'class'      : 'form-control account-email',
      'placeHolder': 'Enter Email',
      'id'         : 'account-email-' + index
    }).data('index', index);
    var $span = $('<span>').addClass('input-group-btn');
    var $button = $('<button type="button">').attr({
      'class'     : 'btn btn-default account-remove-email',
      'aria-label': 'Left Align',
      'id'        : 'account-remove-email-' + index,
      'title'     : 'Remove Email'
    }).data('index', index);
    var $glyph = $('<span>').attr({
      'class'      : 'glyphicon glyphicon-trash',
      'aria-hidden': 'true'
    });
    $button.append($glyph);
    $span.append($button);
    $inputGroup.append($input).append($span);

    this.ui.addEmail.before($inputGroup);
  },

  addTelephoneClicked: function () {
    var index = $('.account-telephone').length;
    var $inputGroup = $('<div>').addClass('input-group');
    var $input = $('<input type="text">').attr({
      'name'       : 'telephone[' + index + ']',
      'width'      : '20',
      'class'      : 'form-control account-telephone',
      'placeHolder': 'Enter Telephone',
      'id'         : 'account-telephone-' + index
    }).data('index', index);
    var $span = $('<span>').addClass('input-group-btn');
    var $button = $('<button type="button">').attr({
      'class'     : 'btn btn-default account-remove-telephone',
      'aria-label': 'Left Align',
      'id'        : 'account-remove-telephone-' + index,
      'title'     : 'Remove Telephone'
    }).data('index', index);
    var $glyph = $('<span>').attr({
      'class'      : 'glyphicon glyphicon-trash',
      'aria-hidden': 'true'
    });
    $button.append($glyph);
    $span.append($button);
    $inputGroup.append($input).append($span);

    this.ui.addTelephone.before($inputGroup);
  },

  removeElementClicked: function (e) {
    $(e.currentTarget).parent().parent().remove();
  },

  onRender: function () {
    var self = this;

    this.loadCountries();

    self.ui.level.val(self.model.get('level'));
  }

});

module.exports = AccountView;
