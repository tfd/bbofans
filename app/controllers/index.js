var mongoose = require('mongoose');
var players = mongoose.collection('Players');

exports.index = function (req, res) {
	res.render('index.html');
};
