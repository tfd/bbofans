/* jshint -W097 */
"use strict";

// Determine the root path of our server.
var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

/**
 * Configurations for different environments. Acces your configuration in this way:
 *
 * <code>
 * var env = process.env.NODE_ENV || 'prod';
 * var config = require('<path to config')[env];
 * </code>
 *
 * Config has the following fields:
 *
 * <dl>
 *  <dt>db</dt>
 *  <dd>The MongoDB database to use</dd>
 *  <dt>root</dt>
 *  <dd>Absolute path to root of the server (without trailing /)</dd>
 *  <dt>app.name</dt>
 *  <dd>Name of the web site</dd>
 *  <dt>omitReCaptcha</dt>
 *  <dd>Whether to use Google Recaptcha or not. If true the Recaptcha codes aren't checked</dd>
 * </dl>
 */

var config = {dev: {}, test: {}, prod: {}};

['dev', 'prod', 'test'].forEach( function(type) {
  config[type].db = 'mongodb://localhost/bbofans_prod';
  config[type].root = rootPath;
  config[type].app = {
    name: 'BBOFans Website'
  };
  config[type].keyStoreFile = rootPath + '/server/data/keyStore.js';
  config[type].omitReCaptcha = false;
  config[type].reCaptcha = {
    key         : 'reCaptcha',
    httpsOptions: {
      host  : 'www.google.com',
      port  : 443,
      path  : '/recaptcha/api/siteverify',
      method: 'POST'
    }
  };
  config[type].mail = {
    key            : 'mail',
    from           : '"BBO Fans Admin" <mailer@bbofans.com>',
    replyTo        : '"BBO Fans Admin" <info@bbofans.com>',
    smtpOptions    : {
      host  : 'smtp.gmail.com',
      port  : 465,
      secure: true,
      auth  : {
        user: 'mailer@bbofans.com'
      }
    },
    confirmationUrl: 'http://www.bbofans.com/register/confirm/:id',
    resetPasswordUrl: 'http://www.bbofans.com/admin/account/reset/:id/:password'
  };
  config[type].bbo = {
    tournamentListUrl: 'http://webutil.bridgebase.com/v2/tarchive.php?m=h&h=bbo+fans',
    tournamentUrlPrefix: 'http://webutil.bridgebase.com/v2/'
  };
});

config.dev.db = 'mongodb://localhost/bbofans_dev';
config.dev.mail.replyTo = '"BBO Fans Admin" <ronald@bbofans.com>';
config.dev.mail.bcc = '"BBO Fans Admin" <ronald@bbofans.com>';
config.dev.mail.confirmationUrl = 'http://local.bbofans.com:3000/register/confirm/:id';
config.dev.mail.resetPasswordUrl = 'http://local.bbofans.com:3000/admin/account/reset/:id/:password';

config.test.db = 'mongodb://localhost/bbofans_test';
config.test.omitReCaptcha = true;

module.exports = config;
