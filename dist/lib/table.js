'use strict';
var __extends = (this && this.__extends) || (function () {
	var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	return function (d, b) {
		extendStatics(d, b);
		function __() { this.constructor = d; }
		d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
})();
Object.defineProperty(exports, '__esModule', { value: true });
var events = require('typescript.events');
var deck_1 = require('./deck');
var defaults_1 = require('./defaults');
var game_1 = require('./game');
var player_1 = require('./player');
var Table = /** @class */ (function (_super) {
	__extends(Table, _super);
	function Table(options) {
		if (options === void 0) { options = new TableOptions(); }
		var _this = _super.call(this) || this;
		_this.smallBlind = defaults_1.SMALL_BLIND;
		_this.bigBlind = defaults_1.BIG_BLIND;
		_this.currentPlayerIndex = 0;
		_this.dealerIndex = 0;
		_this.smallBlindIndex = 0;
		_this.bigBlindIndex = 0;
		_this.deck = new deck_1.Deck().shuffle();
		_this.smallBlind = options.smallBlind;
		_this.bigBlind = options.bigBlind;
		_this.players = options.players || new Array();
		_this.maxPlayers = options.maxPlayers;
		_this.game = new game_1.Game(_this);
		return _this;
	}
	Table.prototype.forEachNonEmptyPlayer = function (fn) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i] && !this.players[i].empty()) {
				fn(this.players[i], i, this.players);
			}
		}
		return this;
	};
	Table.prototype.initNewRound = function () {
		this.game.pot = 0;
		this.game.setRound(game_1.RoundName.Preflop);
		this.game.bets = [];
		this.game.board = [];
		for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
			var player = _a[_i];
			player.folded = false;
			player.acted = false;
			player.allIn = false;
			player.cards = new Array();
			player.SetHand();
			player.prize = 0;
		}
		this.dealerIndex = this.getNextPlayerIndex(this.dealerIndex);
		this.deck.shuffle();
		this.game.newRound();
		return this;
	};
	Table.prototype.fixEmptySeats = function () {
		// TODO:
		// Not sure why this is necessary, research it...
		for (var i = 0; i < this.players.length; i++) {
			var player = this.players[i];
			if (!player) {
				this.players[i] = player_1.Player.EmptySeat(this);
			}
		}
		return this;
	};
	Table.prototype.getNextPlayerIndex = function (currentIndex, findActor) {
		if (currentIndex === void 0) { currentIndex = -1; }
		if (findActor === void 0) { findActor = false; }
		var found = false;
		currentIndex = currentIndex === -1 ? this.currentPlayerIndex : currentIndex;
		while (!found) {
			currentIndex++;
			currentIndex = currentIndex < this.players.length ? currentIndex : 0;
			if (!this.players[currentIndex].empty() && !findActor ||
                !this.players[currentIndex].empty() && findActor && !this.players[currentIndex].acted) {
				if (!this.players[currentIndex].folded && !this.players[currentIndex].allIn) {
					found = true;
				}
			}
		}
		return currentIndex;
	};
	Table.prototype.getMaxBet = function () {
		var bets = this.game.bets;
		var maxBet = 0;
		for (var _i = 0, bets_1 = bets; _i < bets_1.length; _i++) {
			var bet = bets_1[_i];
			if (bet && bet > maxBet) {
				maxBet = bet;
			}
		}
		return maxBet;
	};
	Table.prototype.addPlayer = function (playerOrOptions) {
		var player = new player_1.Player();
		if (playerOrOptions && playerOrOptions instanceof player_1.Player) {
			player = playerOrOptions;
		}
		else {
			player = new player_1.Player(playerOrOptions);
		}
		if (player.playerName === defaults_1.EMPTY_SEAT_NAME) {
			this.emit('addPlayerFailed', 'tried to add empty player');
			return this;
		}
		// remove previous position if player already seated on table
		for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
			var p = _a[_i];
			if (p && p.playerName === player.playerName) {
				p = player_1.Player.EmptySeat(this);
				break;
			}
		}
		var position = 0;
		while (this.players[position] !== undefined) {
			position++;
		}
		player.seated = true;
		player.table = this;
		this.players[position] = player;
		this.emit('addedPlayer', player, position);
		return this;
	};
	Table.prototype.checkForBankrupt = function () {
		for (var i = this.players.length - 1; i >= 0; i--) {
			if (this.players[i].chips <= 0) {
				this.players[i].chips = 0;
				this.emit('playerBankrupt', this.players[i]);
				// TODO: remove bankrupt players from game, but allow to rebuy
			}
		}
		return this;
	};
	Table.prototype.checkForWinner = function () {
		// todo: run tests for side pots
		// not convinced this works 100%
		// GIVEN: player 1 all in, 100 chips, 3 of a kind (3s, 2 in board, A kicker)
		// AND: player 2 all in, 200 chips, 3 of a kind (3s, 2 in board, A kicker)
		// AND: player 3 not all in, 200 chips, 2 pair (2s & As)
		// WHEN: showdown for 500 chip pot (300 all, 200 player 2 & 3)
		// THEN: player 1 should get 150 (I think he may get 200 or even 300)
		// AND: player 2 should get 350 (probably gets the leftover)
		while (!this.roundEnd()) {
			var winners = this.GetWinnersIndexes();
			var allInWinners = this.getAllInWinners(winners);
			var part = 0;
			if (allInWinners.length > 0) {
				part = Math.round(this.getMinBets(allInWinners, winners));
			}
			else {
				part = Math.round(this.game.roundBets[winners[0]]);
			}
			var prize = this.makePrize(part);
			this.GivePrize(winners, prize);
		}
		return this;
	};
	Table.prototype.GivePrize = function (winnersIndexes, prize) {
		var _this = this;
		var won = prize / winnersIndexes.length;
		winnersIndexes.forEach(function (winnerIndex) {
			var winner = _this.players[winnerIndex];
			winner.prize = winner.prize + won;
			winner.chips = Math.round(winner.chips + won);
			if (_this.game.roundBets[winnerIndex] === 0) {
				winner.folded = true;
			}
			_this.emit('prizeWon', winner, won);
		});
		return this;
	};
	Table.prototype.makePrize = function (part) {
		var roundBet = null;
		var prize = 0;
		for (var l = 0; l < this.game.roundBets.length; l++) {
			roundBet = this.game.roundBets[l];
			if (roundBet > part) {
				prize = prize + part;
				this.game.roundBets[l] = this.game.roundBets[l] - part;
			}
			else {
				prize = prize + roundBet;
				this.game.roundBets[l] = 0;
			}
		}
		return prize;
	};
	Table.prototype.getMinBets = function (allInWinners, winners) {
		var minBets = this.game.roundBets[winners[0]];
		for (var j = 1; j < allInWinners.length; j++) {
			var roundBet = this.game.roundBets[winners[j]];
			if (roundBet !== 0 && roundBet < minBets) {
				minBets = roundBet;
			}
		}
		return minBets;
	};
	Table.prototype.getAllInWinners = function (winnersIndexes) {
		var _this = this;
		var allInPlayers = new Array();
		winnersIndexes.forEach(function (winnerIndex) {
			if (_this.players[winnerIndex].allIn) {
				allInPlayers.push(winnerIndex);
			}
		});
		return allInPlayers;
	};
	Table.prototype.GetWinnersIndexes = function () {
		var _this = this;
		var winners = new Array();
		var maxRank = 0.000;
		this.forEachNonEmptyPlayer(function (player, $index) {
			var playerRank = player.hand.rank;
			if (!player.folded) {
				if (playerRank === maxRank && maxRank > 0) {
					winners.push($index);
					_this.emit('playerTies', player);
				}
				else if (playerRank > maxRank) {
					maxRank = playerRank;
					winners = [$index];
					_this.emit('playerWins', player);
				}
				else {
					_this.emit('playerLoses', player);
				}
			}
		});
		return winners;
	};
	Table.prototype.roundEnd = function () {
		var roundEnd = true;
		var i = 0;
		while (roundEnd && i < this.game.roundBets.length) {
			if (this.game.roundBets[i] !== 0) {
				roundEnd = false;
			}
			i++;
		}
		return roundEnd;
	};
	Table.prototype.dealMissingCards = function () {
		var _this = this;
		var missingCards = 5 - this.game.board.length;
		if (missingCards >= 3) {
			// flop 3 cards with a burn
			this.deck.deal(3, true, function (cards) {
				_this.game.board = _this.game.board.concat(cards);
			});
		}
		if (missingCards >= 2) {
			// turn 1 card with a burn
			this.deck.deal(1, true, function (cards) {
				_this.game.board = _this.game.board.concat(cards);
			});
		}
		if (missingCards >= 1) {
			// river 1 card with a burn
			this.deck.deal(1, true, function (cards) {
				_this.game.board = _this.game.board.concat(cards);
			});
		}
		return this;
	};
	Table.prototype.setNextTurnToSmallBlind = function () {
		// Used to set to dealerIndex, and jump to next turn
		// I think this is wrong, because when 2 players dealer is small blind
		this.currentPlayerIndex = this.smallBlindIndex - 1;
		this.game.nextTurn();
		return this;
	};
	Table.prototype.resetActedState = function () {
		this.forEachNonEmptyPlayer(function (player) {
			player.acted = false;
		});
		return this;
	};
	Table.prototype.moveBetsToPot = function () {
		for (var i = 0; i < this.game.bets.length; i++) {
			var bet = Math.round(this.game.bets[i]);
			this.game.pot = this.game.pot + bet;
			this.game.SetRoundBet(i, bet);
			this.game.bets[i] = 0;
		}
		return this;
	};
	Table.prototype.allPlayersTalked = function () {
		var endOfRound = true;
		var i = 0;
		// todo: seems like something like lodash can do this simpler
		// maybe port a method like any, or add dependency?
		// return players.any(!empty, !acted, !folded, !allIn)
		while (endOfRound && i < this.players.length) {
			if (!this.players[i].empty() && !this.players[i].acted && !this.players[i].folded && !this.players[i].allIn) {
				endOfRound = false;
			}
			else {
				i++;
			}
		}
		return endOfRound;
	};
	Table.prototype.allActivePlayersAreAllIn = function () {
		var all = true;
		this.forEachNonEmptyPlayer(function (player) {
			if (!player.allIn && !player.folded) {
				all = false;
			}
		});
		return all;
	};
	Table.prototype.getCurrentPlayer = function () {
		return this.players[this.currentPlayerIndex];
	};
	return Table;
}(events.Event));
exports.Table = Table;
var TableOptions = /** @class */ (function () {
	function TableOptions() {
		this.smallBlind = defaults_1.SMALL_BLIND;
		this.bigBlind = defaults_1.BIG_BLIND;
		this.maxPlayers = defaults_1.MAX_PLAYERS;
	}
	return TableOptions;
}());
exports.TableOptions = TableOptions;
