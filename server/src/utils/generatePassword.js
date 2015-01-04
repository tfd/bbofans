/* jshint -W097 */
"use strict";

/* jshint -W030 */
var extendObject = require('./chai/extendObject');

var GeneratePassword = function () {
  extendObject.flag(this, 'atLeast', 1);
  extendObject.flag(this, 'atMost', 1);
  extendObject.flag(this, 'minLength', 8);
  extendObject.flag(this, 'maxLength', 16);
  extendObject.flag(this, 'fill', false);

  this.password = '';
};

var charTypes = {
  punctuation: '!:?;,.',
  brackets   : '()[]{}',
  apostrophes: '\'"`',
  math       : '+-*/<>=%',
  others     : '@#$^&_\\|~',
  lowercase  : 'abcdefghijklmnopqrstuvwxyz',
  uppercase  : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers    : '0123456789'
};
charTypes.number = charTypes.numbers;
charTypes.bracket = charTypes.brackets;
charTypes.apostrophe = charTypes.apostrophes;
charTypes.other = charTypes.others;
charTypes.special = charTypes.specials =
charTypes.punctuation + charTypes.brackets + charTypes.apostrophes + charTypes.math + charTypes.other;
charTypes.letter = charTypes.letters = charTypes.lowercase + charTypes.uppercase;
charTypes.all = charTypes.specials + charTypes.letters + charTypes.numbers;

function pick(str, min, max) {
  var n, chars = '', i;

  if (max === undefined) {
    n = min;
  }
  else {
    n = min + Math.floor(Math.random() * (max - min));
  }

  for (i = 0; i < n; i++) {
    chars += str.charAt(Math.floor(Math.random() * str.length));
  }

  return chars;
}

// Credit to @Christoph: http://stackoverflow.com/a/962890/464744
function shuffle(str) {
  var array = str.split(''),
      tmp, current, top = array.length;

  if (top) {
    while (--top) {
      current = Math.floor(Math.random() * top);
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }
  }

  return array.join('');
}

/**
 * ### Language Chains
 *
 * The following are provided as chainable getters to
 * improve the readability of your assertions. They
 * do not provide testing capabilities unless they
 * have been overwritten by a plugin.
 *
 * **Chains**
 *
 * - to
 * - be
 * - been
 * - is
 * - that
 * - and
 * - has
 * - have
 * - with
 * - at
 * - same
 *
 * @name language chains
 * @api public
 */
['to', 'be', 'been', 'is', 'and', 'has', 'have', 'with', 'that', 'at', 'same'].forEach(function (chain) {
  extendObject.addProperty(GeneratePassword.prototype, chain, function () {});
});

extendObject.addMethod(GeneratePassword.prototype, 'get', function (minimum, maximum, charSet) {
  var min = parseInt(minimum, 10);
  var max = parseInt(maximum, 10);
  var type = (charSet === undefined ? 'all' : charSet);

  if (!isNaN(min) || !isNaN(max)) {
    if (!isNaN(min)) { this.withMinLength(min); }
    if (!isNaN(max)) { this.withMaxLength(max); }

    if (this[type]) {
      this[type];
    }
    else {
      this.of(charSet);
    }
  }

  return this.password;
});

extendObject.addMethod(GeneratePassword.prototype, 'least', function (value) {
  var val = parseInt(value, 10);
  var max = extendObject.flag(this, 'atLeast');

  if (isNaN(val) || val <= 0) { return; }

  extendObject.flag(this, 'atLeast', val);
  if (max < val) { extendObject.flag(this, 'atMost', val); }
  extendObject.flag(this, 'fill', false);
});

extendObject.addMethod(GeneratePassword.prototype, 'most', function (value) {
  var val = parseInt(value, 10);
  var min = extendObject.flag(this, 'atLeast');

  if (isNaN(val) || val <= 0) { return; }

  extendObject.flag(this, 'atMost', val);
  if (min > val) { extendObject.flag(this, 'atLeast', val); }
  extendObject.flag(this, 'fill', false);
});

extendObject.addMethod(GeneratePassword.prototype, 'exactly', function (value) {
  var val = parseInt(value, 10);

  if (isNaN(val) || val <= 0) { return; }

  extendObject.flag(this, 'atLeast', val);
  extendObject.flag(this, 'atMost', val);
  extendObject.flag(this, 'fill', false);
});

extendObject.addMethod(GeneratePassword.prototype, 'between', function (minimum, maximum) {
  var min = parseInt(minimum, 10);
  var max = parseInt(maximum, 10);

  if (isNaN(min) || min <= 0 || isNaN(max) || max <= 0) { return; }

  if (min > max) {
    if (max <= 0) {
      max = min;
    }
    else {
      min = max;
    }
  }

  extendObject.flag(this, 'atLeast', min);
  extendObject.flag(this, 'atMost', max);
  extendObject.flag(this, 'fill', false);
});

function withMinLength(value) {
  /* jshint validthis:true */
  var val = parseInt(value, 10);
  var max = extendObject.flag(this, 'maxLength');

  if (isNaN(val) || val <= 0) { return; }

  extendObject.flag(this, 'minLength', val);
  if (max < val) { extendObject.flag(this, 'maxLength', val); }
  extendObject.flag(this, 'fill', true);
}
extendObject.addMethod(GeneratePassword.prototype, 'withMinLength', withMinLength);
extendObject.addMethod(GeneratePassword.prototype, 'withMinLen', withMinLength);
extendObject.addMethod(GeneratePassword.prototype, 'minLength', withMinLength);
extendObject.addMethod(GeneratePassword.prototype, 'minLen', withMinLength);
extendObject.addMethod(GeneratePassword.prototype, 'min', withMinLength);

function withMaxLength(value) {
  /* jshint validthis:true */
  var val = parseInt(value, 10);
  var min = extendObject.flag(this, 'minLength');

  if (isNaN(val) || val <= 0) { return; }

  extendObject.flag(this, 'maxLength', val);
  if (min > val) { extendObject.flag(this, 'minLength', val); }
  extendObject.flag(this, 'fill', true);
}
extendObject.addMethod(GeneratePassword.prototype, 'withMaxLength', withMaxLength);
extendObject.addMethod(GeneratePassword.prototype, 'withMaxLen', withMaxLength);
extendObject.addMethod(GeneratePassword.prototype, 'maxLength', withMaxLength);
extendObject.addMethod(GeneratePassword.prototype, 'maxLen', withMaxLength);
extendObject.addMethod(GeneratePassword.prototype, 'max', withMaxLength);

function withLength(minimum, maximum) {
  /* jshint validthis:true */
  var min = parseInt(minimum, 10);
  var max = parseInt(maximum, 10);

  if (isNaN(min) || min <= 0) { return; }

  if (isNaN(max) || max <= 0) { max = min; }

  extendObject.flag(this, 'minLength', min);
  extendObject.flag(this, 'maxLength', max);
  extendObject.flag(this, 'fill', true);
}
extendObject.addMethod(GeneratePassword.prototype, 'withLength', withLength);
extendObject.addMethod(GeneratePassword.prototype, 'withLen', withLength);
extendObject.addMethod(GeneratePassword.prototype, 'length', withLength);
extendObject.addMethod(GeneratePassword.prototype, 'len', withLength);

extendObject.addProperty(GeneratePassword.prototype, 'shuffle', function () {
  if (this.password.length < extendObject.flag(this, 'minLength')) {
    this.all;
  }
  this.password = shuffle(this.password);
});

function createPropertyForCharacterType(type) {
  return function () {
    var min = extendObject.flag(this, 'atLeast');
    var max = extendObject.flag(this, 'atMost');
    var len = this.password.length;

    if (extendObject.flag(this, 'fill')) {
      max = extendObject.flag(this, 'maxLength') - len;
      min = extendObject.flag(this, 'minLength') - len;
      if (max < 0 || min < 0) { return; }
    }

    this.password += pick(charTypes[type], min, max);
    extendObject.flag(this, 'atLeast', 1);
    extendObject.flag(this, 'atMost', 1);
    extendObject.flag(this, 'fill', false);
  };
}

var type;
for (type in charTypes) {
  if (charTypes.hasOwnProperty(type)) {
    extendObject.addProperty(GeneratePassword.prototype, type, createPropertyForCharacterType(type));
  }
}

extendObject.addMethod(GeneratePassword.prototype, 'of', function (str) {
  var min = extendObject.flag(this, 'atLeast');
  var max = extendObject.flag(this, 'atMost');
  var len = this.password.length;

  if (extendObject.flag(this, 'fill')) {
    max = extendObject.flag(this, 'maxLength') - len;
    min = extendObject.flag(this, 'minLength') - len;
    if (max < 0 || min < 0) { return; }
  }

  this.password += pick(str, min, max);
  extendObject.flag(this, 'atLeast', 1);
  extendObject.flag(this, 'atMost', 1);
  extendObject.flag(this, 'fill', false);
});

/**
 * ### GeneratePassword
 *
 * Object that can be used to generate a password.
 *
 * The following methods and properties are defined:
 *
 * <dl>
 * <dt>atLeast(num)</dt>
 * <dd>Generate a substring of at least num characters</dd>
 * <dt>atMost(num)</dt>
 * <dd>Generate a substring of at most num characters</dd>
 * <dt>between(min, max)</dt>
 * <dd>Generate a substring of at least min and at most max characters</dd>
 * <dt>exactly(num)</dt>
 * <dd>Generate a substring of exactly num characters</dd>
 * <dt>withMinLength(num)</dt>
 * <dd>Generate a substring so that the resulting password has at least num characters</dd>
 * <dt>withMaxLength(num)</dt>
 * <dd>Generate a substring so that the resulting password has at most num characters</dd>
 * <dt>withLength(num)</dt>
 * <dd>Generate a substring so that the resulting password has exactly num characters</dd>
 * <dt>lowercase</dt>
 * <dd>Generate a substring of lowercase alphabetic characters</dd>
 * <dt>uppercase</dt>
 * <dd>Generate a substring of uppercase alphabetic characters</dd>
 * <dt>numbers</dt>
 * <dd>Generate a substring of numeric characters</dd>
 * <dt>specials</dt>
 * <dd>Generate a substring of special characters</dd>
 * <dt>of(str)</dt>
 * <dd>Generate a substring of characters taken randomly from str</dd>
 * <dt>get()</dt>
 * <dd>Get the generated password</dd>
 * </dl>
 *
 * Usage:
 *
 * <code>
 *    var pwd = new GeneratePassword().atLeast(2).numbers
 *                                    .atMost(5).uppercase
 *                                    .withMinLength(8).withMaxLength(10).lowercase
 *                                    .shuffle.get();
 * </code>
 *
 * @name GeneratePassword
 * @api public
 */

module.exports = GeneratePassword;
