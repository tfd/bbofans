
var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
  dev: {
    db: 'mongodb://localhost/bbofans_dev',
    root: rootPath,
    app: {
      name: 'BBOFans Website'
    },
    omitRecaptcha: true
  },
  test: {
    db: 'mongodb://localhost/bbofans_test',
    root: rootPath,
    app: {
      name: 'BBOFans Website'
    },
    omitRecaptcha: true
  },
  prod: {}
}
