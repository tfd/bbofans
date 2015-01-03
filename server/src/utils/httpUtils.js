/* jshint -W097 */
"use strict";

/**
 * @module httpUtils
 */

/**
 * @callback httpUtils~responseCallback
 * @param {String} str - the data received.
 */
module.exports = {

  /**
   * Handle the response from a http(s) request.
   *
   * @function httpUtils#handleHttpResponse
   * @param {httpUtils~responseCallback} callback -  function called with the received data.
   */
  handleHttpResponse: function (callback) {
    return function (response) {
      var str = '';

      response.setEncoding('utf8');

      // another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      // the whole response has been received, so we can process it
      response.on('end', function () {
        callback(str);
      });
    };
  }

};