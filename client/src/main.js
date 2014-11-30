var bbofansApp = require('./bbofans');
var homepageApp = require('./homepage/module.js');
var rockApp = require('./rock/module.js');

bbofansApp.setApp(homepageApp);
bbofansApp.start();
