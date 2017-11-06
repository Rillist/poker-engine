// import oldLogic = require('../lib/logic');

export const helloWorld = (hello = 'hello', world = 'world') => {
	return `${hello} ${world}!`;
};

// export let newTable = oldLogic.newTable;
export { Table } from './table';
export { Player, PlayerOptions } from './player';

// todo: decouple modules, by accepting params for other models?
// todo: make events consistent, const for names, respons models, etc.
// todo: add support for antes
// todo: add support for no-limit and limit rules
// todo: add support for tournament
