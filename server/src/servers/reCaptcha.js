/* jshint -W097 */
"use strict";

var httpUtils = require('./../utils/httpUtils');
var _ = require('underscore');

module.exports = function (config) {

  var getRemoteIpAddress = function (req, callback) {
    var http = require('http');
    var options = {
      host: 'checkip.dyndns.com'
    };

    http.request(options, httpUtils.handleHttpResponse(function (str) {
      var ipAddresses = str.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
      callback(ipAddresses ? ipAddresses[0] : '');
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
    getRemoteIpAddress(req, function (remoteIp) {
      if (!remoteIp) {
        return callback({
          passed: false,
          error : 'Unable to get ip address'
        });
      }

      config.servers.keyStore.get(config.reCaptcha.key, function (privateKey) {
        if (!privateKey) {
          return callback({
            passed: false,
            error : 'Private key not found'
          });
        }

        var queryString = require('querystring');
        var qs = queryString.stringify({
          secret  : privateKey,
          response: response,
          remoteip: remoteIp
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

  return {
    check: function (req, res) {
      var response = req.params['g-recaptcha-response'];
      checkCaptcha(req, response, function (response) {
        res.json(response);
      });
    },

    checkDirect: function (req, response, callback) {
      checkCaptcha(req, response, callback);
    }
  };
};
