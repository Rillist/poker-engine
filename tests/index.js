const { Console } = require('console');
const console = new Console(process.stdout, process.stderr);

var TestTable = require('./test-table');
var TestPlayer1 = { playerName: 'Player 1' };
var TestPlayer2 = { playerName: 'Player 2' };
var TestPlayer3 = { playerName: 'Player 3' };

// GIVEN
TestTable.round = 'River';
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



TestTable = TestTable.reset();
var cardsShown = function(p) { console.log(p.playerName, p.hand.message, p.hand.cards, p.hand.rank); };
// GIVEN
TestTable.round = 'River';
TestTable.game.board = ['3H', '4H', '5H', '6S', '7S'];
TestTable.addPlayer(TestPlayer1).addPlayer(TestPlayer2).addPlayer(TestPlayer3);
TestTable.players[0].cards = ['AH', '2H']; // Straight Flush
TestTable.players[1].cards = ['KH', 'QH']; // Flush
TestTable.players[2].cards = ['8S', '9S']; // Straight
TestTable.game.bets = [25, 50, 100];
TestTable.on('playerWins', cardsShown);
TestTable.on('playerTies', cardsShown);
TestTable.on('playerLoses', cardsShown);
TestTable.on('prizeWon', (player, amount) => {
	console.log('prizeWon', player.playerName, amount, player.hand.message, player.hand.cards);
});
// WHEN
TestTable.progress();
TestTable.forEachNonEmptyPlayer((p) => {
	p.SetHand();
});
// TestTable.checkForWinner();

// THEN
console.log(TestTable.players[0].hand.message === 'Straight Flush', TestTable.players[0].hand.message);
console.log(TestTable.players[1].hand.message === 'Flush', TestTable.players[1].hand.message);
console.log(TestTable.players[2].hand.message === 'Straight', TestTable.players[2].hand.message);