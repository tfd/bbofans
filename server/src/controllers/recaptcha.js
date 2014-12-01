var env = process.env.NODE_ENV || 'dev';
var config = require('../../config/config')[env];

var handleHttpResponse = function (callback) {
  return function (response) {
    var str = '';

    // another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    // the whole response has been recieved, so we can process it
    response.on('end', function () {
      callback(str);
    });
  };
};

var getRemoteIpAddress = function (req, callback) {
  var http = require('http');
  var options = {
    host: 'checkip.dyndns.com'
  };

  http.request(options, handleHttpResponse(function (data) {
    var prefix = 'Current IP Address: ';
    callback(str.substr(prefix.length));
  })).end();
};

var callRecaptchaServer = function (qs, callback) {
  var https = require('https');

  var options = {
    host: 'www.google.com',
    port: 443,
    path: '/recaptcha/api/verify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(qs)
    }
  };

  https.request(options, handleHttpResponse(function (rsp) {
    console.log(rsp);
    var parts = rsp.split('\n');
    callback({
      passed: parts[0] === 'true',
      error: parts[1] || ''
    });
  })).write(qs).end();
};

var getPrivateKey = function (callback) {
  var fs = require('fs');
  fs.readFile('./config/recaptcha.key', 'utf8', function (err, privatekey) {
    if (err) console.log(err);
    callback(err ? null : privatekey);
  });
};

var checkCaptcha = function (req, challenge, response, callback) {

  getRemoteIpAddress(req, function (remoteip) {
    if (!remoteip) {
      return callback({
        passed: false,
        error: 'Unable to get ip address'
      });
    }

    getPrivateKey(function (privatekey) {
      if (!privatekey) {
        return callback({
          passed: false,
          error: 'Private key not found'
        });
      }

      var querystring = require('querystring');
      var data = querystring.stringify({
        privatekey: privatekey,
        challenge: challenge,
        response: response,
        remoteip: remoteip
      });

      callRecaptchaServer(data, callback);
    });
  });
};

if (config.omitRecaptcha === true) {
  checkCaptcha = function (req, challenge, response, callback) {
    callback({ passed: true, error: '' });
  };
}

module.exports = {
  
  check: function (req, res) {
    var challenge = req.params.challenge;
    var response = req.params.response;
    console.log('check ' + challenge + ' ' + response);
    checkCaptcha(req, challenge, response, function (response) {
      console.log(response);
      res.json(response);
    });
  },

  checkDirect: function (req, challenge, response, callback) {
    checkCaptcha(req, challenge, response, callback);
  }
};
