/* jshint -W097 */
"use strict";

module.exports = function () {
  return {
    index: function (req, res) {
      res.render('index.hbs', { user: req.user });
    }
  };
};
