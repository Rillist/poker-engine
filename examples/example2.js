const { Console } = require('console');
const console = new Console(process.stdout, process.stderr);
var poker = require('../js-lib/index');

var table = new poker.Table();

table.on('addPlayerFailed', (msg) => {
	console.log('addPlayerFailed', msg);
});

table.on('addedPlayer', (player, index) => {
	console.log('addedPlayer', player.playerName, index);
});

table.on('startFailed', (msg) => {
	console.log('startFailed', msg);
});

table.on('gameStarted', (game) => {
	console.log('gameStarted', game.round);
});

table.on('dealRoundCompleted', (dealer, game) => {
	console.log('dealRoundCompleted', dealer.playerName, game.round);
});

table.on('flopRoundCompleted', (board) => {
	console.log('flopRoundCompleted', board);
});

table.on('turnRoundCompleted', (board) => {
	console.log('turnRoundCompleted', board);
});

table.on('riverRoundCompleted', (board) => {
	console.log('riverRoundCompleted', board);
});

table.on('smallBlindPaid', (player, amount) => {
	console.log('smallBlindPaid', player.playerName, amount);
});

table.on('bigBlindPaid', (player, amount) => {
	console.log('bigBlindPaid', player.playerName, amount);
});

table.on('invalidBet', (msg, callAmount, bet) => {
	console.log('invalidBet', msg, callAmount, bet);
});

table.on('playerBet', (bet, player) => {
	console.log('playerBet', player.playerName, bet);
});

table.on('playerRaised', (raise, player) => {
	console.log('playerRaised', player.playerName, raise);
});

table.on('playerCalled', (amount, player) => {
	console.log('playerCalled', player.playerName, amount);
});

table.on('invalidCheck', (msg, amount) => {
	console.log('invalidCheck', msg, amount);
});

table.on('playerChecked', (player) => {
	console.log('playerChecked', player.playerName);
});

table.on('playerBankrupt', (player) => {
	console.log('playerBankrupt', player.playerName);
	player.chips = 1000;
	console.log('rebuys');
});

table.on('playerWins', (player) => {
	console.log('playerWins', player.playerName, player.hand.message, player.hand.cards);
});

table.on('playerTies', (player) => {
	console.log('playerTies', player.playerName, player.hand.message, player.hand.cards);
});

table.on('playerLoses', (player) => {
	console.log('playerLoses', player.playerName, player.hand.message, player.hand.cards);
});

table.on('prizeWon', (player, amount) => {
	console.log('prizeWon', player.playerName, amount, player.hand.message, player.hand.cards);
});

var gamecount = 0;
table.on('gameOver', () => {
	console.log('gameOver', table.game.board);
	table.forEachNonEmptyPlayer((p) => {
		console.log(p.playerName, p.chips);
	});
	gamecount++;
	console.log('gamecount:', gamecount);
	table.initNewRound();
});

table.on('wrongTurn', (msg) => {
	console.log('wrongTurn', msg);
});

table.on('nextTurn', function (player) {
	console.log('turn', player.playerName);
	switch (player.playerName.toLowerCase()) {
	case 'shark':
		break;
	case 'noob':
		break;
	case 'joe':
		break;
	default:
		break;
	}
	player.call();
});


table.addPlayer(new poker.PlayerOptions({
	playerName: 'shark',
	chips: 300
}));

table.addPlayer(new poker.Player({
	playerName: 'noob',
	chips: 300
}));

table.addPlayer(
	new poker.Player(
		new poker.PlayerOptions({
			playerName: 'joe',
			chips: 300
		})
	)
);

table.addPlayer({
	playerName: 'schmoe',
	chips: 300
});

table.startGame();
