var MenuCollection = require('../../common/navbar/model');

var collection = new MenuCollection();
collection.add([{
  href: '/rock/members',
  title: 'Members'
}, {
  href: '/rock/awards',
  title: 'Award Points'
}, {
  href: '/rock/matchpoints',
  title: 'Matchpoints'
}]);

module.exports = collection;
