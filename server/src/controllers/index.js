/* jshint -W097 */
"use strict";

module.exports = function () {
  return {
    index: function (req, res) {
      if (req.path.length > 1) {
        // No path after / as we use # for marionette navigation.
        return res.redirect(301, '/');
      }
      res.render('index.hbs', { user: req.user });
    }
  };
};
