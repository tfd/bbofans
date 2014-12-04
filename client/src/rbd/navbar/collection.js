var MenuCollection = require('../../common/navbar/model');

var collection = new MenuCollection();
collection.add([{
  href: '/rbd/members',
  title: 'Members'
}, {
  href: '/rbd/awards',
  title: 'Award Points'
}, {
  href: '/rbd/matchpoints',
  title: 'Matchpoints'
}]);

module.exports = collection;
