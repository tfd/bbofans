var $ = require('jquery');
var _ = require('underscore');

var reCaptchaReady = false;
var cb = _.noop;
var container = '';

window.onReCaptchaLoaded = function () {
  reCaptchaReady = true;
  cb();
};

$.getScript('https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoaded&render=explicit');

function render () {
  grecaptcha.render(container, {
        sitekey: '6Ldpiv0SAAAAABQTt9sEh3l6nT2ixMwFVJLZl47I',
        theme  : "white"
      }
  );
}

module.exports = {
  render: function (selector) {
    container = selector;
    if (! reCaptchaReady) {
      cb = render;
    }
    else {
      render();
    }
  },

  reset: function () {
    grecaptcha.reset();
  }

};
