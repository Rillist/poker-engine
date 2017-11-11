const { Console } = require('console');
const console = new Console(process.stdout, process.stderr);

var TestTable = require('./test-table');
var TestPlayer1 = { playerName: 'Player 1' };
var TestPlayer2 = { playerName: 'Player 2' };
var TestPlayer3 = { playerName: 'Player 3' };

// GIVEN
TestTable.game.started = true;
TestTable.game.round = 'Showdown';
TestTable.game.board = ['7S', 'KS', 'KH', 'AH', 'QD'];
TestTable.addPlayer(TestPlayer1).addPlayer(TestPlayer2);
TestTable.players[0].cards = ['7H', '7D'];
TestTable.players[1].cards = ['AS', 'QS'];
TestTable.players[0].acted = true;
TestTable.players[1].acted = true;
// WHEN
TestTable.game.progressRound();
// THEN
console.assert(TestTable.players[0].hand.message === 'Full House', 'Expected Full House, got:', TestTable.players[0].hand.message);
console.assert(TestTable.players[1].hand.message === 'Two Pair', 'Expected Two Pair, got:', TestTable.players[1].hand.message);


TestTable = TestTable.reset();
// GIVEN
TestTable.game.started = true;
TestTable.game.round = 'Showdown';
TestTable.game.board = ['3H', '4H', '5H', '6S', '7S'];
TestTable.addPlayer(TestPlayer1).addPlayer(TestPlayer2).addPlayer(TestPlayer3);
TestTable.players[0].cards = ['AH', '2H']; // Straight Flush
TestTable.players[1].cards = ['KH', 'QH']; // Flush
TestTable.players[2].cards = ['8S', '9S']; // Straight
TestTable.players[0].acted = true;
TestTable.players[1].acted = true;
TestTable.players[2].acted = true;
TestTable.game.bets = [25, 50, 100];
//var cardsShown = function(p) { console.log(p.playerName, p.hand.message, p.hand.cards, p.hand.rank); };
//TestTable.on('playerWins', cardsShown);
//TestTable.on('playerTies', cardsShown);
//TestTable.on('playerLoses', cardsShown);

// THEN
TestTable.on('prizeWon', (player, amount) => {
	var asserted = (player.playerName === TestPlayer1.playerName && amount === 75) ||
		(player.playerName === TestPlayer2.playerName && amount === 50) ||
		(player.playerName === TestPlayer3.playerName && amount === 50);
	console.assert(asserted, 'prizeWon', player.playerName, amount, player.hand.message, player.hand.cards);
});
// WHEN
TestTable.game.progressRound();