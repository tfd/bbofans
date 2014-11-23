var MenuCollection = require('../../common/models/navbar');

var collection = new MenuCollection();
collection.add([{
  href: 'rules',
  trigger: 'homepage:rules',
  title: 'Rules'
}, {
  href: 'awards',
  trigger: 'homepage:awards',
  title: 'Award System'
}, {
  href: 'matchpoints',
  trigger: 'homepage:matchpoints',
  title: 'Matchpoint System'
}, {
  href: 'bbolinks',
  trigger: 'homepage:bbolinks',
  title: 'Links to BBO'
}]);

module.exports = collection;
