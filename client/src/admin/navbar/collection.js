var NavbarMenuCollection = require('../../navbar/model');

var adminNavbarMenuCollection = new NavbarMenuCollection();
adminNavbarMenuCollection.add([{
  href: '/admin/logout',
  title: 'Logout'
}]);

module.exports = adminNavbarMenuCollection;
