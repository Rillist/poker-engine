'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var defaults_1 = require('./defaults');
var hand_evaluator_1 = require('./hand-evaluator');
var Player = /** @class */ (function () {
	function Player(options) {
		if (options === void 0) { options = new PlayerOptions(); }
		this.playerName = defaults_1.EMPTY_SEAT_NAME;
		this.cards = new Array();
		this.hand = new hand_evaluator_1.Hand({ cards: this.cards });
		this.chips = 0;
		this.prize = 0;
		this.folded = false;
		this.allIn = false;
		this.acted = false;
		this.seated = false;
		this.playerName = options && options.playerName ? options.playerName : defaults_1.EMPTY_SEAT_NAME;
		this.chips = options && options.chips ? options.chips : 0;
	}
	Player.EmptySeat = function (table) {
		var nonSeatedPlayer = new Player();
		if (table) {
			nonSeatedPlayer.table = table;
		}
		return nonSeatedPlayer;
	};
	Player.prototype.empty = function () {
		return this.playerName === defaults_1.EMPTY_SEAT_NAME;
	};
	Player.prototype.SimpleBet = function (bet, isBlind) {
		var _this = this;
		if (!this.isTurn()) {
			return false;
		}
		// not sure why reffing table, this.table.players[index].chips
		// when chips var on this object (this.chips)
		// test and fix if not needed
		var index = this.getIndex();
		var protectedBet = bet <= this.table.players[index].chips
			? bet
			: this.table.players[index].chips;
		var callAmount = this.callAmount();
		if (bet < callAmount) {
			this.table.emit('invalidBet', 'did not meet call amount', callAmount, bet);
			return false;
		}
		this.table.game.SetBet(index, protectedBet);
		this.table.players[index].chips = this.table.players[index].chips - protectedBet;
		this.acted = true;
		if (this.table.players[index].chips <= 0) {
			this.allIn = true;
		}
		if (!isBlind && bet > callAmount) {
			this.table.emit('playerBet', protectedBet, this);
			if (callAmount > 0) {
				this.table.emit('playerRaised', bet - callAmount, this);
			}
			this.table.forEachNonEmptyPlayer(function (p) {
				if (!p.folded && !p.allIn && p.GetBet() < _this.table.getMaxBet()) {
					p.acted = false;
				}
			});
		}
		else if (bet === callAmount) {
			this.table.emit('playerCalled', callAmount, this);
		}
		else if (!isBlind) {
			this.table.emit('playerBet', protectedBet, this);
		}
		return true;
	};
	Player.prototype.callAmount = function () {
		var maxBet = this.table.getMaxBet();
		var currentBet = this.GetBet();
		return (maxBet - currentBet);
	};
	Player.prototype.GetBet = function () {
		var index = this.getIndex();
		return this.table.game.bets[index] || 0;
	};
	Player.prototype.isTurn = function () {
		if (this.table.currentPlayerIndex !== this.getIndex()) {
			// interesting...
			// copy paste gives idea to emit events from related models
			this.table.emit('wrongTurn', {
				shouldBe: this.table.currentPlayerIndex,
				violator: this.getIndex()
			});
			return false;
		}
		return true;
	};
	Player.prototype.call = function () {
		var callAmount = this.callAmount();
		if (callAmount <= 0) {
			return this.check();
		}
		if (!this.SimpleBet(callAmount)) {
			return false;
		}
		this.acted = true;
		this.table.game.progressRound();
		return true;
	};
	Player.prototype.check = function () {
		if (!this.isTurn()) {
			return false;
		}
		var callAmount = this.callAmount();
		if (callAmount > 0) {
			this.table.emit('invalidCheck', 'must call the current bet', callAmount);
			return false;
		}
		this.table.emit('playerChecked', this);
		this.acted = true;
		this.table.game.progressRound();
		return true;
	};
	Player.prototype.getIndex = function () {
		var found = false;
		var i = 0;
		while (i < this.table.players.length && !found) {
			if (this !== this.table.players[i]) {
				i++;
			}
			else {
				found = true;
			}
		}
		return i;
	};
	Player.prototype.SetHand = function () {
		this.hand.cards = this.cards.concat(this.table.game.board);
		this.hand = hand_evaluator_1.HandEvaluator.evalHand(this.hand);
		return this;
	};
	Player.prototype.bet = function (bet) {
		if (!this.SimpleBet(bet)) {
			return false;
		}
		this.acted = true;
		this.table.game.progressRound();
		return true;
	};
	Player.prototype.raise = function (bet) {
		return this.bet(bet);
	};
	Player.prototype.fold = function () {
		if (!this.isTurn()) {
			return this;
		}
		this.folded = true;
		this.acted = true;
		this.table.emit('playerFolded', this);
		this.table.game.progressRound();
		return this;
	};
	return Player;
}());
exports.Player = Player;
var PlayerOptions = /** @class */ (function () {
	function PlayerOptions(options) {
		this.playerName = options && options.playerName || defaults_1.EMPTY_SEAT_NAME;
		this.chips = options && options.chips || 0;
	}
	return PlayerOptions;
}());
exports.PlayerOptions = PlayerOptions;
