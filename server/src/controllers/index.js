/* jshint -W097 */
"use strict";

module.exports = {
  index: function (req, res) {
    res.render('index.hbs', { user: req.user });
  }
};
