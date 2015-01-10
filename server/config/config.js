/* jshint -W097 */
"use strict";

// Determine the root path of our server.
var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

/**
 * Configurations for different environments. Acces your configuration in this way:
 *
 * <code>
 * var env = process.env.NODE_ENV || 'dev';
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
module.exports = {
  dev : {
    db              : 'mongodb://localhost/bbofans_dev',
    root            : rootPath,
    app             : {
      name: 'BBOFans Website'
    },
    keyStoreFile    : rootPath + '/server/data/keyStore.js',
    omitReCaptcha   : false,
    reCaptcha       : {
      key         : 'reCaptcha',
      httpsOptions: {
        host  : 'www.google.com',
        port  : 443,
        path  : '/recaptcha/api/siteverify',
        method: 'POST'
      }
    },
    mail            : {
      key            : 'mail',
      from           : '"BBO Fans Admin" <mailer@bbofans.com>',
      replyTo        : '"BBO Fans Admin" <info@bbofans.com>',
      bcc            : '"BBO Fans Admin" <info@bbofans.com>',
      smtpOptions    : {
        host  : 'smtp.gmail.com',
        port  : 465,
        secure: true,
        auth  : {
          user: 'mailer@bbofans.com'
        }
      },
      confirmationUrl: 'http://local.bbofans.com:3000/register/confirm/:id'
    },
    bbo             : {
      tournamentListUrl: 'http://webutil.bridgebase.com/v2/tarchive.php?m=h&h=bbo+fans'
    }
  },
  test: {
    db           : 'mongodb://localhost/bbofans_test',
    root         : rootPath,
    app          : {
      name: 'BBOFans Website'
    },
    omitReCaptcha: true
  },
  prod: {
    db              : 'mongodb://localhost/bbofans_prod',
    root            : rootPath,
    app             : {
      name: 'BBOFans Website'
    },
    keyStoreFile    : rootPath + '/server/data/keyStore.js',
    omitReCaptcha   : false,
    reCaptcha       : {
      key         : 'reCaptcha',
      httpsOptions: {
        host  : 'www.google.com',
        port  : 443,
        path  : '/recaptcha/api/siteverify',
        method: 'POST'
      }
    },
    mail            : {
      key            : 'mail',
      from           : '"BBO Fans Admin" <mailer@bbofans.com>',
      replyTo        : '"BBO Fans Admin" <info@bbofans.com>',
      bcc            : '"BBO Fans Admin" <info@bbofans.com>',
      confirmationUrl: 'http://www.bbofans.com/register/confirm/:id',
      smtpOptions    : {
        host  : 'smtps.aruba.it',
        port  : 465,
        secure: true,
        auth  : {
          user: 'mailer@bbofans.com'
        }
      }
    },
    bbo             : {
      tournamentListUrl: 'http://webutil.bridgebase.com/v2/tarchive.php?m=h&h=bbo+fans'
    }
  }
};
