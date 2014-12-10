var bbofansApp = require('./bbofans');
var homepageApp = require('./homepage/module.js');
var rockApp = require('./rock/module.js');
var rbdApp = require('./rbd/module.js');
var adminApp = require('./admin/module.js');

bbofansApp.setApp(homepageApp);
bbofansApp.start();
