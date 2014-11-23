var bbofansApp = require('./bbofans');
var homepageApp = require('./homepage/module.js');

bbofansApp.start();
bbofansApp.setApp(homepageApp);