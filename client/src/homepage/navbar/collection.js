var MenuCollection = require('../../common/navbar/model');

var collection = new MenuCollection();
collection.add([{
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

module.exports = collection;
