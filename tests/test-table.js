var poker = require('../dist/lib/index');

var table = new poker.Table().startGame();
table.reset = function(){
	return new poker.Table().startGame();
};

module.exports = table;