/* jshint -W097 */
"use strict";

var env = process.env.NODE_ENV || 'dev';
var config = require('../../config/config')[env];
var fileUtils = require('../utils/fileUtils');
var httpUtils = require('../utils/httpUtils');
var _ = require('underscore');

var getRemoteIpAddress = function (req, callback) {
  var http = require('http');
  var options = {
    host: 'checkip.dyndns.com'
  };

  http.request(options, httpUtils.handleHttpResponse(function (str) {
    var prefix = 'Current IP Address: ';
    callback(str.substr(prefix.length));
  })).end();
};

var callReCaptchaServer = function (qs, callback) {
  var https = require('https');

  var options = _.extend({}, config.reCaptcha.httpsOptions);
  options.headers = {
    'Content-Type'  : 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(qs)
  };

  var httpsRequest = https.request(options, httpUtils.handleHttpResponse(function (rsp) {
    console.log(rsp);
    var parts = rsp.split('\n');
    callback({
      passed: parts[0] === 'true',
      error : parts[1] || ''
    });
  }));
  httpsRequest.write(qs);
  httpsRequest.end();
};

var checkCaptcha = function (req, response, callback) {

  getRemoteIpAddress(req, function (remoteip) {
    if (!remoteip) {
      return callback({
        passed: false,
        error : 'Unable to get ip address'
      });
    }

    fileUtils.readFileToString(config.reCaptcha.keyFile, function (privatekey) {
      if (!privatekey) {
        return callback({
          passed: false,
          error : 'Private key not found'
        });
      }

      var queryString = require('querystring');
      var qs = queryString.stringify({
        secret  : privatekey,
        response: response,
        remoteip: remoteip
      });

      callReCaptchaServer(qs, callback);
    });
  });
};

if (config.omitReCaptcha === true) {
  checkCaptcha = function (req, response, callback) {
    callback({passed: true, error: ''});
  };
}

module.exports = {

  check: function (req, res) {
    var response = req.params['g-recaptcha-response'];
    checkCaptcha(req, response, function (response) {
      console.log(response);
      res.json(response);
    });
  },

  checkDirect: function (req, response, callback) {
    checkCaptcha(req, response, callback);
  }
};
