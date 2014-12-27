var NavbarMenuCollection = require('../../navbar/model');

var rbdNavbarMenuCollection = new NavbarMenuCollection();
rbdNavbarMenuCollection.add([{
  href: '/rbd/member',
  title: 'Members'
}, {
  href: '/rbd/awards',
  title: 'Award Points'
}, {
  href: '/rbd/matchpoints',
  title: 'Matchpoints'
}]);

module.exports = rbdNavbarMenuCollection;
