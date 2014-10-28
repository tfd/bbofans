var mongoose = require('mongoose');
var Player = mongoose.model('Player');

exports.index = function (req, res) {
	res.render('index.html');
};
