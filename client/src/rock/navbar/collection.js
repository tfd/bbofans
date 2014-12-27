var NavbarMenuCollection = require('../../navbar/model');

var rockNavbarMenuCollection = new NavbarMenuCollection();
rockNavbarMenuCollection.add([{
  href: '/rock/member',
  title: 'Members'
}, {
  href: '/rock/awards',
  title: 'Award Points'
}, {
  href: '/rock/matchpoints',
  title: 'Matchpoints'
}]);

module.exports = rockNavbarMenuCollection;
