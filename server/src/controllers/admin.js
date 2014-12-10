var mongoose = require('mongoose');
var User = mongoose.model('User');
var Generator = require('../utils/generatePassword');

User.find({ username : 'admin' }).count(function (err, count) {
  if (count === 0) {
    // At least admin should be there.
    var password = new Generator().exactly(3).uppercase
                                  .exactly(2).numbers
                                  .length(8).lowercase
                                  .shuffle.get();
    new User({
      username: 'admin',
      password: password,
      isUserManager: true,
      isMemberManager: true,
      isBlacklistManager: true,
      isTdManager: true
    }).save(function (err, admin) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('Admin password=' + password);
      }
    });
  }
});

module.exports = {
  
  session: function (req, res) {
    var redirectTo = req.session.returnTo ? req.session.returnTo : '/admin/home';
    delete req.session.returnTo;
    res.redirect(redirectTo);
  },

  logout: function (req, res) {
    req.logout();
    res.redirect('/admin/login');
  }

};
