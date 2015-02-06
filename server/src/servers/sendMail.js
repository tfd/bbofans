/* jshint -W097 */
"use strict";

/**
 * @module sendMail
 */

var nodeMailer = require('nodemailer');
var fileUtils = require('./../utils/fileUtils');
var _ = require('underscore');

module.exports = function (config) {

  var transporter = null;

  config.servers.keyStore.get(config.mail.key, function (password) {
    var smtpOptions = _.extend({}, config.mail.smtpOptions);
    smtpOptions.auth.pass = password;

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails
    transporter = nodeMailer.createTransport(smtpOptions);
  });

  /**
   * @callback sendMail~mailCallback
   * @param {Object} err - the error object if message failed
   * @param {Object} info - includes the result, the exact format depends on the transport mechanism used
   * @param {String} info.messageId - most transports should return the final Message-Id value used with this property
   * @param {Object} info.envelope - includes the envelope object for the message
   * @param {String[]} info.accepted - is an array returned by SMTP transports (includes recipient addresses that were
   *     accepted by the server)
   * @param {String[]} info.rejected - is an array returned by SMTP transports (includes recipient addresses that were
   *     rejected by the server)
   * @param {String[]} info.pending - is an array returned by Direct SMTP transport. Includes recipient addresses that
   *     were temporarily rejected together with the server response
   * @param {String} response - is a string returned by SMTP transports and includes the last SMTP response from the
   *     server
   */

  /**
   * Send mail via the mailer SMTP.
   *
   * @function sendMail
   * @param {Object} mailOptions
   * @param {String|String[]} mailOptions.to - Comma separated list or an array of recipients e-mail addresses that
   *     will appear on the To: field
   * @param {String|String[]} [mailOptions.cc] - Comma separated list or an array of recipients e-mail addresses that
   *     will appear on the Cc: field
   * @param {String|String[]} [mailOptions.bcc] - Comma separated list or an array of recipients e-mail addresses that
   *     will appear on the Bcc: field
   * @param {String} [mailOptions.inReplyTo] - The message-id this message is replying
   * @param {String|String[]} [mailOptions.references] - Message-id list (an array or space separated string)
   * @param {String} mailOptions.subject - The subject of the e-mail
   * @param {String} mailOptions.text - The plaintext version of the message as an Unicode string, Buffer, Stream or an
   *     object {path: '...'}
   * @param {String} [mailOptions.html] - The HTML version of the message as an Unicode string, Buffer, Stream or an
   *     object {path: '...'}
   * @param {Object|Object[]} [mailOptions.headers] - An object or array of additional header fields (e.g.
   *     {"X-Key-Name": "key value"} or [{key: "X-Key-Name", value: "val1"}, {key: "X-Key-Name", value: "val2"}])
   * @param {String[]} [mailOptions.attachments] - An array of attachment objects (see below for details)
   * @param {String[]} [mailOptions.alternatives] - An array of alternative text contents (in addition to text and html
   *     parts) (see below for details)
   * @param {String} [mailOptions.envelope] - optional SMTP envelope, if auto generated envelope is not suitable (see
   *     below for details)
   * @param {String} [mailOptions.messageId] - optional Message-Id value, random value will be generated if not set
   * @param {String} [mailOptions.date] - optional Date value, current UTC string will be used if not set
   * @param {String} [mailOptions.encoding] - optional transfer encoding for the textual parts (defaults to
   *     'quoted-printable')
   * @param {sendMail~mailCallback} cb
   */
  return function (mailOptions, cb) {
    mailOptions.from = config.mail.from;
    if (!mailOptions.replyTo) {
      mailOptions.replyTo = config.mail.replyTo;
    }
    if (!mailOptions.bcc) {
      mailOptions.bcc = config.mail.bcc;
    }
    console.log(mailOptions);
    transporter.sendMail(mailOptions, cb);
  };

};
