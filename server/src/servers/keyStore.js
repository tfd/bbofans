/* jshint -W097 */
"use strict";

/**
 * @module keyStore
 */

var _ = require('underscore');
var fileUtils = require('./../utils/fileUtils');

module.exports = function (config) {

  var values = {};
  var initializedCallbacks = {
    callbacks: [],

    add: function (fn) {
      this.callbacks.push(fn);
    },

    call: function () {
      _.each(this.callbacks, function (fn) {
        fn();
      });
    }
  };

  fileUtils.readFileToJson(config.keyStoreFile, function (keys) {
    _.each(keys, function (val, key) {
      values[key] = val;
    });
    initializedCallbacks.call();
  });

  /**
   * Callback for the {@link KeyStore#get} method.
   *
   * @callback KeyStore~getCallback
   * @param {String} value - the value read from the key store.
   */

  /**
   * @class KeyStore
   */
  return {

    /**
     * Get the value for the given key.
     *
     * @param {String} key - name of value to get,
     * @param {KeyStore~getCallback} cb - function called with the value read from the store.
     * @returns {String} the value associated with the key, or undefined if key doesn't excist.
     */
    get: function (key, cb) {
      if (_.isEmpty(values)) {
        initializedCallbacks.add(function () {
          cb(values[key]);
        });
      }
      else {
        cb(values[key]);
      }
    }

  };
};