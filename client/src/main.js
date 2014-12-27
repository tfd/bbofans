var BboFansApp = require('./bbofans');
require('moment').locale(window.navigator.language);

var bboFansApp = new BboFansApp({container: '#bbofans-app-container'});
bboFansApp.start();
