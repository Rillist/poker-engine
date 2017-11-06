const { Console } = require('console');
const console = new Console(process.stdout, process.stderr);

var TestTable = require('./test-table');
var TestPlayer1 = { playerName: 'Player 1' };
var TestPlayer2 = { playerName: 'Player 2' };

// GIVEN
TestTable.round = 'Showdown';
TestTable.game.board = ['7S', 'KS', 'KH', 'AH', 'QD'];
TestTable.addPlayer(TestPlayer1).addPlayer(TestPlayer2);
TestTable.players[0].cards = ['7H', '7D'];
TestTable.players[1].cards = ['AS', 'QS'];
// WHEN
TestTable.progress();
TestTable.forEachNonEmptyPlayer((p) => {
	p.SetHand();
});
// THEN
console.log(TestTable.players[0].hand.message === 'Full House', TestTable.players[0].hand.message);
console.log(TestTable.players[1].hand.message === 'Two Pair', TestTable.players[1].hand.message);