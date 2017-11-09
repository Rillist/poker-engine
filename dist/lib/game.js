'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var defaults_1 = require('./defaults');
var Game = /** @class */ (function () {
	function Game(table) {
		this.pot = 0;
		this.round = RoundName.Deal;
		this.board = new Array();
		this.bets = new Array();
		this.roundBets = new Array();
		this.started = false;
		this.table = table;
	}
	Game.prototype.start = function () {
		if (this.started) {
			this.table.emit('startFailed', 'already started');
			return this;
		}
		if (this.NonEmptyPlayerCount() >= defaults_1.MIN_PLAYERS) {
			this.started = true;
			this.newRound();
			this.table.emit('gameStarted', this);
			return this;
		}
		else {
			this.table.emit('startFailed', 'not enough players');
		}
		return this;
	};
	Game.prototype.progressRound = function () {
		if (this.table.allPlayersTalked()) {
			this.table.moveBetsToPot();
			if (this.table.allActivePlayersAreAllIn() || this.round === RoundName.River) {
				this.setRound(RoundName.Showdown);
			}
			else if (this.round === RoundName.Turn) {
				this.setRound(RoundName.River);
			}
			else if (this.round === RoundName.Flop) {
				this.setRound(RoundName.Turn);
			}
			else if (this.round === RoundName.Preflop) {
				this.setRound(RoundName.Flop);
			}
			else if (this.round === RoundName.Deal) {
				this.setRound(RoundName.Preflop);
			}
		}
		else {
			this.nextTurn();
		}
		return this;
	};
	Game.prototype.setRound = function (round) {
		var _this = this;
		this.round = round;
		switch (round) {
		case RoundName.Deal:
			break;
		case RoundName.Flop:
			this.table.resetActedState();
			this.table.deck.deal(3, true, function (cards) {
				_this.board = _this.board.concat(cards);
				_this.table.forEachNonEmptyPlayer(function (p) {
					p.SetHand();
				});
				_this.table.emit('flopRoundCompleted', _this.board);
				_this.table.setNextTurnToSmallBlind();
			});
			break;
		case RoundName.Turn:
			this.table.resetActedState();
			this.table.deck.deal(1, true, function (cards) {
				_this.board = _this.board.concat(cards);
				_this.table.forEachNonEmptyPlayer(function (p) {
					p.SetHand();
				});
				_this.table.emit('turnRoundCompleted', _this.board);
				_this.table.setNextTurnToSmallBlind();
			});
			break;
		case RoundName.River:
			this.table.resetActedState();
			this.table.deck.deal(1, true, function (cards) {
				_this.board = _this.board.concat(cards);
				_this.table.forEachNonEmptyPlayer(function (p) {
					p.SetHand();
				});
				_this.table.emit('riverRoundCompleted', _this.board);
				_this.table.setNextTurnToSmallBlind();
			});
			break;
		case RoundName.Showdown:
			this.table.dealMissingCards();
			this.table.forEachNonEmptyPlayer(function (p) {
				p.SetHand();
			});
			this.table.checkForWinner();
			this.table.checkForBankrupt();
			setImmediate(function () {
				_this.table.emit('gameOver');
			});
			break;
		default:
			break;
		}
		return this;
	};
	Game.prototype.newRound = function () {
		this.table.deck.shuffle();
		return this.resetBets()
			.assignBlinds()
			.payBlinds()
			.dealCards()
			.nextTurn();
	};
	Game.prototype.nextTurn = function () {
		this.table.currentPlayerIndex = this.table.getNextPlayerIndex(this.table.currentPlayerIndex, true);
		// todo: maybe emit player options like check, bet, fold
		this.table.emit('nextTurn', this.table.players[this.table.currentPlayerIndex]);
		return this;
	};
	Game.prototype.dealCards = function () {
		var _this = this;
		// Deal 1 card at a time, 2 off the top is not correct
		var dealOneCardToPlayer = function (p) {
			_this.table.deck.deal(1, false, function (dealtCards) {
				p.cards = p.cards.concat(dealtCards);
				p.SetHand();
			});
		};
		// Deal 2 cards to each non-empty player
		this.table
			.forEachNonEmptyPlayer(dealOneCardToPlayer)
			.forEachNonEmptyPlayer(dealOneCardToPlayer);
		this.table.emit('dealRoundCompleted', this.table.players[this.table.dealerIndex], this);
		return this;
	};
	Game.prototype.resetBets = function () {
		this.bets = new Array(this.table.players.length);
		this.roundBets = new Array(this.table.players.length);
		return this;
	};
	Game.prototype.assignBlinds = function () {
		if (this.NonEmptyPlayerCount() > 2) {
			this.table.smallBlindIndex = this.table.getNextPlayerIndex(this.table.dealerIndex);
		}
		else {
			this.table.smallBlindIndex = this.table.dealerIndex;
		}
		this.table.bigBlindIndex = this.table.getNextPlayerIndex(this.table.smallBlindIndex);
		return this;
	};
	Game.prototype.payBlinds = function () {
		this.table.currentPlayerIndex = this.table.smallBlindIndex;
		this.table
			.players[this.table.currentPlayerIndex]
			.SimpleBet(this.table.smallBlind, true);
		if (!this.table.players[this.table.currentPlayerIndex].allIn) {
			this.table.players[this.table.currentPlayerIndex].acted = false;
		}
		this.table.emit('smallBlindPaid', this.table.players[this.table.smallBlindIndex], this.table.smallBlind);
		// REFACTOR: opportunity, only diff here is big blind
		this.table.currentPlayerIndex = this.table.bigBlindIndex;
		this.table
			.players[this.table.currentPlayerIndex]
			.SimpleBet(this.table.bigBlind, true);
		if (!this.table.players[this.table.currentPlayerIndex].allIn) {
			this.table.players[this.table.currentPlayerIndex].acted = false;
		}
		this.table.emit('bigBlindPaid', this.table.players[this.table.bigBlindIndex], this.table.bigBlind);
		// END REFACTOR
		return this;
	};
	Game.prototype.NonEmptyPlayerCount = function () {
		var totalActivePlayers = 0;
		if (!this.table) {
			return totalActivePlayers;
		}
		this.table.forEachNonEmptyPlayer(function () {
			totalActivePlayers++;
		});
		return totalActivePlayers;
	};
	Game.prototype.SetBet = function (playerIndex, betAmount) {
		for (var i = 0; i <= playerIndex; i++) {
			this.bets[i] = this.bets[i] || 0;
		}
		this.bets[playerIndex] = this.bets[playerIndex] + betAmount;
		return this;
	};
	Game.prototype.SetRoundBet = function (playerIndex, betAmount) {
		for (var i = 0; i <= playerIndex; i++) {
			this.roundBets[i] = this.roundBets[i] || 0;
		}
		this.roundBets[playerIndex] = this.roundBets[playerIndex] + betAmount;
		return this;
	};
	return Game;
}());
exports.Game = Game;
var RoundName;
(function (RoundName) {
	RoundName['Deal'] = 'Deal';
	RoundName['Preflop'] = 'Preflop';
	RoundName['Flop'] = 'Flop';
	RoundName['Turn'] = 'Turn';
	RoundName['River'] = 'River';
	RoundName['Showdown'] = 'Showdown';
})(RoundName = exports.RoundName || (exports.RoundName = {}));
