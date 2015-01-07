/* jshint -W097 */
"use strict";

var Form = require('../../common/views/formWithErrorHandling');

var $ = require('jquery');

var TdEditView = Form.extend({
  template: require('./template.hbs'),
  idPrefix: 'member',

  ui: Form.extendUi({
    'skill'   : '#member-skill',
    'addEmail'       : '#member-add-email',
    'addTelephone'   : '#member-add-telephone',
    'removeEmail'    : '.member-remove-email',
    'removeTelephone': '.member-remove-telephone'
  }),

  events: Form.extendEvents({
    'click @ui.addEmail'       : 'addEmailClicked',
    'click @ui.addTelephone'   : 'addTelephoneClicked',
    'click @ui.removeEmail'    : 'removeElementClicked',
    'click @ui.removeTelephone': 'removeElementClicked'
  }),

  addEmailClicked: function () {
    var index = $('.member-email').length;
    var $inputGroup = $('<div>').addClass('input-group');
    var $input = $('<input type="email">').attr({
      'name'       : 'email[' + index + ']',
      'width'      : '20',
      'class'      : 'form-control member-email',
      'placeHolder': 'Enter Email',
      'id'         : 'member-email-' + index
    }).data('index', index);
    var $span = $('<span>').addClass('input-group-btn');
    var $button = $('<button type="button">').attr({
      'class'     : 'btn btn-default member-remove-email',
      'aria-label': 'Left Align',
      'id'        : 'member-remove-email-' + index,
      'title'     : 'Remove Telephone'
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
    var index = $('.member-telephone').length;
    var $inputGroup = $('<div>').addClass('input-group');
    var $input = $('<input type="text">').attr({
      'name'       : 'telephone[' + index + ']',
      'width'      : '20',
      'class'      : 'form-control member-telephone',
      'placeHolder': 'Enter Telephone',
      'id'         : 'member-telephone-' + index
    }).data('index', index);
    var $span = $('<span>').addClass('input-group-btn');
    var $button = $('<button type="button">').attr({
      'class'     : 'btn btn-default member-remove-telephone',
      'aria-label': 'Left Align',
      'id'        : 'member-remove-telephone-' + index,
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

    self.ui.skill.val(self.model.get('skill'));
  }

});

module.exports = TdEditView;
