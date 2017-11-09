var poker = require('../dist/lib/index');

var table = new poker.Table();
table.reset = function(){
	var reset = new poker.Table();
	return reset;
};

module.exports = table;