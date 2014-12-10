var MenuCollection = require('../../common/navbar/model');

var collection = new MenuCollection();
collection.add([{
  href: '/admin/logout',
  title: 'Logout'
}]);

module.exports = collection;
