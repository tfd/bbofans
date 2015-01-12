/* jshint -W097 */
"use strict";

module.exports = function (model) {
  var user = model.toJSON();
  var collection = [];

  if (user.isTd) {
    if (user.isMemberManager) {
      collection.push({
        href: '/admin/members',
        title: 'Members'
      });
    }

    collection.push({
      href: '/admin/blacklist',
      title: 'Blacklist'
    });
  }

  if (user.isTdManager) {
    collection.push({
      href: '/admin/tds',
      title: 'TDs'
    });
  }

  collection.push({
    href : '/admin/account/:id,' + user._id,
    title: 'Account'
  });

  collection.push({
    href : '/admin/account/password/:id,' + user._id,
    title: 'Change password'
  });

  collection.push({
     href : '/admin/logout',
     title: 'Logout'
   });

  return collection;
};
