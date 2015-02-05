/* jshint -W097 */
"use strict";

var Form = require('../../common/views/formWithErrorHandling');
var Backbone = require('backbone');
require('backbone.syphon');
var $ = require('jquery');

var MemberEditView = Form.extend({
  template: require('./template.hbs'),
  idPrefix: 'member',

  ui: Form.extendUi({
    'validate'       : '.form-validate',
    'nation'         : '#member-nation',
    'level'          : '#member-level',
    'role'           : '#member-role',
    'skill'          : '#member-skill',
    'td'             : '#member-td',
    'addEmail'       : '#member-add-email',
    'addTelephone'   : '#member-add-telephone',
    'removeEmail'    : '.member-remove-email',
    'removeTelephone': '.member-remove-telephone'
  }),

  events: Form.extendEvents({
    'click @ui.validate'       : 'validateClicked',
    'click @ui.addEmail'       : 'addEmailClicked',
    'click @ui.addTelephone'   : 'addTelephoneClicked',
    'click @ui.removeEmail'    : 'removeElementClicked',
    'click @ui.removeTelephone': 'removeElementClicked'
  }),

  validateClicked: function (e) {
    e.preventDefault();
    var data = Backbone.Syphon.serialize(this);
    this.trigger("form:validate", data);
  },

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

    function showTdBox(role) {
      if (role !== 'member') {
        self.ui.td.show();
      }
      else {
        self.ui.td.hide();
      }
    }

    this.loadCountries();

    self.ui.level.val(self.model.get('level') || 'beginner');
    self.ui.role.val(self.model.get('role') || 'member');
    self.ui.skill.val(self.model.get('skill') || 'Tournament TD');

    showTdBox(self.model.get('role'));
    self.ui.role.on('change', function () {
      if ($(this).val() !== 'member' && !self.model.get('skill')) {
        self.model.set('skill', 'Tournament TD');
        self.ui.skill.val(self.model.get('skill'));
      }
      showTdBox($(this).val());
    });
  }

});

module.exports = MemberEditView;
