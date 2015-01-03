/* jshint -W097 */
"use strict";

var _ = require('underscore');

/**
 * Handles a path in the form [module.module.module]controller:method
 *
 * Has various methods to iterate this path so it can be parsed recursively, one module at a time.
 *
 * @class
 */
module.exports = function (path) {
  var match = /^\[([\w\.]*)\](\w*):(\w*)$/.exec(path);
  var moduleName = match[1];
  var controller = match[2];
  var method = match[3];
  var modules = moduleName.split('.');
  var currentModule = 0;

  function getNthModuleName(n) {
    // n is zero-index, so increment it by 1 to get the correct number of modules.
    n += 1;

    return _.first(modules, n).join('.');
  }

  return {
    /**
     * Get the full name of the last module
     *
     * @returns {String} the fully qualified module name.
     */
    getFullModuleName: function () {
      return moduleName;
    },

    /**
     * Get the full name of the current module.
     *
     * @returns {String} the fully qualified module name.
     */
    getModuleName: function () {
      return getNthModuleName(currentModule);
    },

    /**
     * Get the full name of the next module in the chain.
     * This will increment the current module index, so a next call to {@link #getModuleName} will return this very same
     * name.
     *
     * @returns {String} the fully qualified module name.
     */
    getNextModuleName: function () {
      if (currentModule < modules.length - 1) { currentModule += 1; }
      return this.getModuleName();
    },

    /**
     * @returns {boolean} Whether this is the last module in the chain.
     */
    isLastModule: function () {
      return currentModule >= modules.length - 1;
    },

    /**
     * Returns the name of the controller. Note that this should have meaning only for the latest module.
     *
     * @returns {String} the name of the controller
     */
    getControllerName: function () {
      return controller;
    },

    /**
     * Returns the name of the method. Note that this should have meaning only for the latest module.
     *
     * @returns {String} the name of the method.
     */
    getMethodName: function () {
      return method;
    }
  };
};
