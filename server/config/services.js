/* jshint -W097 */
"use strict";

module.exports = function (app, config, passport) {

  /**
   * Utilities
   */

  config.servers = {};
  config.servers.keyStore = require('../src/servers/keyStore')(config);
  config.servers.sendMail = require('../src/servers/sendMail')(config);
  config.servers.reCaptcha = require('../src/servers/reCaptcha')(config);
  config.servers.setup = require('../src/servers/setup')(config);

};
