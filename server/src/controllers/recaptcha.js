var env = process.env.NODE_ENV || 'dev';
var config = require('../../config/config')[env];

var handleHttpResponse = function (callback) {
  return function (response) {
    var str = '';

    // another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    // the whole response has been received, so we can process it
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

  http.request(options, handleHttpResponse(function (str) {
    var prefix = 'Current IP Address: ';
    callback(str.substr(prefix.length));
  })).end();
};

var callReCaptchaServer = function (qs, callback) {
  var https = require('https');

  var options = {
    host   : 'www.google.com',
    port   : 443,
    path   : '/recaptcha/api/siteverify',
    method : 'POST',
    headers: {
      'Content-Type'  : 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(qs)
    }
  };

  var httpsRequest = https.request(options, handleHttpResponse(function (rsp) {
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

var getPrivateKey = function (callback) {
  var fs = require('fs');
  fs.readFile('./server/config/recaptcha.key', 'utf8', function (err, privatekey) {
    if (err) {
      console.log(err);
    }
    callback(err ? null : privatekey);
  });
};

var checkCaptcha = function (req, response, callback) {

  getRemoteIpAddress(req, function (remoteip) {
    if (!remoteip) {
      return callback({
        passed: false,
        error : 'Unable to get ip address'
      });
    }

    getPrivateKey(function (privatekey) {
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

if (config.omitRecaptcha === true) {
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
