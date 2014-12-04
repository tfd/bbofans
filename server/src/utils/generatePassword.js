/* jshint -W030 */
var addProperty = require('./addProperty');
var addMethod = require('./addMethod');
var flag = require('./flag');
var GeneratePassword = function () {
  flag(this, 'atLeast', 1);
  flag(this, 'atMost', 1);
  flag(this, 'minLength', 8);
  flag(this, 'maxLength', 16);
  flag(this, 'fill', false);

  this.password = '';
};

var charTypes = {
  punctuation: '!:?;,.',
  brackets: '()[]{}',
  apostrophes: '\'"`',
  math: '+-*/<>=%',
  others: '@#$^&_\\|~',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789'
};
charTypes.number = charTypes.numbers;
charTypes.bracket = charTypes.brackets;
charTypes.apostrophe = charTypes.apostrophes;
charTypes.other = charTypes.others;
charTypes.special = charTypes.specials = charTypes.punctuation + charTypes.brackets + charTypes.apostrophes + charTypes.math + charTypes.other;
charTypes.letter = charTypes.letters = charTypes.lowercase + charTypes.uppercase;
charTypes.all = charTypes.specials + charTypes.letters + charTypes.numbers;

function pick(str, min, max) {
    var n, chars = '';

    if (typeof max === 'undefined') {
        n = min;
    } else {
        n = min + Math.floor(Math.random() * (max - min));
    }

    for (var i = 0; i < n; i++) {
        chars += str.charAt(Math.floor(Math.random() * str.length));
    }

    return chars;
}

// Credit to @Christoph: http://stackoverflow.com/a/962890/464744
function shuffle(str) {
    var array = str.split('');
    var tmp, current, top = array.length;

    if (top) while (--top) {
        current = Math.floor(Math.random() * top);
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
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
[ 'to', 'be', 'been', 'is', 'and', 'has', 'have', 'with', 'that', 'at', 'same' ].forEach(function (chain) {
  addProperty(GeneratePassword.prototype, chain, function () {});
});

addMethod(GeneratePassword.prototype, 'get', function (minimum, maximum, charSet) {
  var min = parseInt(minimum, 10);
  var max = parseInt(maximum, 10);
  var type = (typeof charSet == 'undefined' ? 'all' : charSet);

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

addMethod(GeneratePassword.prototype, 'least', function (value) {
  var val = parseInt(value, 10);
  var max = flag(this, 'atLeast');

  if (isNaN(val) || val <= 0) { return; }

  flag(this, 'atLeast', val);
  if (max < val) { flag(this, 'atMost', val); }
  flag(this, 'fill', false);
});

addMethod(GeneratePassword.prototype, 'most', function (value) {
  var val = parseInt(value, 10);
  var min = flag(this, 'atLeast');

  if (isNaN(val) || val <= 0) { return; }

  flag(this, 'atMost', val);
  if (min > val) { flag(this, 'atLeast', val); }
  flag(this, 'fill', false);
});

addMethod(GeneratePassword.prototype, 'exactly', function (value) {
  var val = parseInt(value, 10);

  if (isNaN(val) || val <= 0) { return; }

  flag(this, 'atLeast', val);
  flag(this, 'atMost', val);
  flag(this, 'fill', false);
});

addMethod(GeneratePassword.prototype, 'between', function (minimum, maximum) {
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

  flag(this, 'atLeast', min);
  flag(this, 'atMost', max);
  flag(this, 'fill', false);
});

function withMinLength(value) {
  var val = parseInt(value, 10);
  var max = flag(this, 'maxLength');

  if (isNaN(val) || val <= 0) { return; }

  flag(this, 'minLength', val);
  if (max < val) { flag(this, 'maxLength', val); }
  flag(this, 'fill', true);
}
addMethod(GeneratePassword.prototype, 'withMinLength', withMinLength);
addMethod(GeneratePassword.prototype, 'withMinLen', withMinLength);
addMethod(GeneratePassword.prototype, 'minLength', withMinLength);
addMethod(GeneratePassword.prototype, 'minLen', withMinLength);
addMethod(GeneratePassword.prototype, 'min', withMinLength);

function withMaxLength(value) {
  var val = parseInt(value, 10);
  var min = flag(this, 'minLength');

  if (isNaN(val) || val <= 0) { return; }

  flag(this, 'maxLength', val);
  if (min > val) { flag(this, 'minLength', val); }
  flag(this, 'fill', true);
}
addMethod(GeneratePassword.prototype, 'withMaxLength', withMaxLength);
addMethod(GeneratePassword.prototype, 'withMaxLen', withMaxLength);
addMethod(GeneratePassword.prototype, 'maxLength', withMaxLength);
addMethod(GeneratePassword.prototype, 'maxLen', withMaxLength);
addMethod(GeneratePassword.prototype, 'max', withMaxLength);

function withLength(minimum, maximum) {
  var min = parseInt(minimum, 10);
  var max = parseInt(maximum, 10);

  if (isNaN(min) || min <= 0) { return; }

  if (isNaN(max) || max <= 0) { max = min; }

  flag(this, 'minLength', min);
  flag(this, 'maxLength', max);
  flag(this, 'fill', true);
}
addMethod(GeneratePassword.prototype, 'withLength', withLength);
addMethod(GeneratePassword.prototype, 'withLen', withLength);
addMethod(GeneratePassword.prototype, 'length', withLength);
addMethod(GeneratePassword.prototype, 'len', withLength);

addProperty(GeneratePassword.prototype, 'shuffle', function () {
  if (this.password.length < flag(this, 'minLength')) {
    this.all;
  }
  this.password = shuffle(this.password);
});

function createPropertyForCharacterType(type) {
  return function () {
    var min = flag(this, 'atLeast');
    var max = flag(this, 'atMost');
    var len = this.password.length;

    if (flag(this, 'fill')) {
      max = flag(this, 'maxLength') - len;
      min = flag(this, 'minLength') - len;
      if (max < 0 || min < 0) { return; }
    }

    this.password += pick(charTypes[type], min, max);
    flag(this, 'atLeast', 1);
    flag(this, 'atMost', 1);
    flag(this, 'fill', false);
  };
}
for (var type in charTypes) {
  if(charTypes.hasOwnProperty(type)) {
    addProperty(GeneratePassword.prototype, type, createPropertyForCharacterType(type));
  }
}
addMethod(GeneratePassword.prototype, 'of', function (str) {  
  var min = flag(this, 'atLeast');
  var max = flag(this, 'atMost');
  var len = this.password.length;

  if (flag(this, 'fill')) {
    max = flag(this, 'maxLength') - len;
    min = flag(this, 'minLength') - len;
    if (max < 0 || min < 0) { return; }
  }

  this.password += pick(str, min, max);
  flag(this, 'atLeast', 1);
  flag(this, 'atMost', 1);
  flag(this, 'fill', false);
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
 *    var pwd = new GeneratePassword().atLeast(2).numbers
                                       .atMost(5).uppercase
                                       .withMinLength(8).withMaxLength(10).lowercase
                                       .shuffle.get();
 *
 * @name GeneratePassword
 * @api public
 */

module.exports = GeneratePassword;
