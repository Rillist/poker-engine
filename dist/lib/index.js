'use strict';
// import oldLogic = require('../lib/logic');
Object.defineProperty(exports, '__esModule', { value: true });
exports.helloWorld = function (hello, world) {
	if (hello === void 0) { hello = 'hello'; }
	if (world === void 0) { world = 'world'; }
	return hello + ' ' + world + '!';
};
// export let newTable = oldLogic.newTable;
var table_1 = require('./table');
exports.Table = table_1.Table;
var player_1 = require('./player');
exports.Player = player_1.Player;
exports.PlayerOptions = player_1.PlayerOptions;
// todo: decouple modules, by accepting params for other models?
// todo: make events consistent, const for names, respons models, etc.
// todo: add support for antes
// todo: add support for no-limit and limit rules
// todo: add support for tournament
