import oldLogic = require('../lib/logic')

export var helloWorld = function(hello:string = 'hello', world:string = 'world'){
	return `${hello} ${world}!`;
};

export var newTable = oldLogic.newTable;
