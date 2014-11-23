var MenuCollection = require('../../common/models/navbar');

var collection = new MenuCollection();
collection.add([{
  href: 'rock/members',
  trigger: 'rock:members',
  title: 'Members'
}, {
  href: 'rock/awards',
  trigger: 'rock:awards',
  title: 'Award Points'
}, {
  href: 'rock/matchpoints',
  trigger: 'rock:matchpoints',
  title: 'Matchpoints'
}]);

module.exports = collection;
