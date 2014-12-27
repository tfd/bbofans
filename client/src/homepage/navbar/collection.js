var NavbarMenuCollection = require('../../navbar/model');

var homepageNavbarMenuCollection = new NavbarMenuCollection();
homepageNavbarMenuCollection.add([{
  href: '/rules',
  title: 'Rules'
}, {
  href: '/awards',
  title: 'Award System'
}, {
  href: '/matchpoints',
  title: 'Matchpoint System'
}, {
  href: '/bbolinks',
  title: 'Links to BBO'
}]);

module.exports = homepageNavbarMenuCollection;
