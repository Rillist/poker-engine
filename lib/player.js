'use strict';
var Result = require('./result.js').Result;
var utils = require('./utils.js');
var EventEmitter = require('events').EventEmitter;

function Player(options) {
	this.playerName = options.playerName;
	this.chips = options.chips || 0;
	this.folded = false;
	this.isAllIn = false;
	this.talked = false;
	this.isSeated = false;
	this.isEmptySeat = options.playerName === 'Empty seat';
	this.table = options.table; //Circular reference to allow reference back to parent object.
	this.cards = [];
	this.prize = 0;
}

// inherit from Event emitter
Player.prototype.__proto__ = EventEmitter.prototype;


Player.prototype.getIndex = function() {
	var found = false,
		i = 0;

	while (i < this.table.players.length && !found) {
		if(this !== this.table.players[i]) {
			i++;
		} else {
			found = true;
		}
	}

	return i;
};

Player.prototype.checkTurn = function() {
	if (this.table.currentPlayer !== this.getIndex()) {
		console.log('WRONG TURN, should be',this.table.currentPlayer, ' you are',this.getIndex() );
		this.emit('wrongTurn');
		var self = this;
        
		this.table.emit('wrongTurn',{
			shouldBe: this.table.currentPlayer,
			violator: self.getIndex()
		});

		return false;
	}
	return true;
};
// Bet, support all in state
Player.prototype.SimpleBet = function(bet, isBlind) {
	if (!this.checkTurn()) {
		return false;
	}

	var callAmount = this.callAmount();
	if(bet < callAmount){
		console.log('INVALID BET, should be more than call amount to raise: ', callAmount );
		this.emit('invalidBet');
		return false;
	}
	
	var index = this.getIndex();
	var protectedBet = bet <= this.table.players[index].chips ? bet : this.table.players[index].chips;

	this.table.game.bets = utils.protectArrayBet(this.table.game.bets, index, protectedBet);
	this.table.players[index].chips = this.table.players[index].chips - protectedBet;
	this.talked = true;

	if(this.table.players[index].chips <= 0) {
		this.isAllIn = true;
		console.log(this.table.getCurrentPlayerLabel() + ' is all in !');
	}

	if(!isBlind && bet > callAmount) {
		console.log(this.table.getCurrentPlayerLabel() + ' bets ' + bet);
		if (callAmount > 0) {
			console.log(this.table.getCurrentPlayerLabel()  + ' has raised ', bet - callAmount);
		}
		this.table.resetTalkedStatusOnRaise(this);
	} else if(bet === callAmount){
		console.log(this.table.getCurrentPlayerLabel(), 'called', callAmount);
	} else if(!isBlind) {
		console.log(this.table.getCurrentPlayerLabel() + ' bets ' + bet);
	}

	return true;
};

Player.prototype.GetBet = function() {
	var index = this.getIndex();
	return this.table.game.bets[index] || 0;
};

Player.prototype.GetRoundBet = function() {
	var index = this.getIndex();
	return this.table.game.roundBets[index] || 0;
};


Player.prototype.check = function() {
	if (!this.checkTurn()) {
		return false;
	}
	var callAmount = this.callAmount();
	if(callAmount > 0){
		console.log('INVALID CHECK, must call the current bet to play: ', callAmount );
		return false;
	}
	console.log(this.table.getCurrentPlayerLabel() + ' checked');
	this.talked = true;
	this.table.progress();
};

Player.prototype.fold = function() {
	if (!this.checkTurn()) {
		return false;
	}
    
	console.log(this.table.getCurrentPlayerLabel() + ' folded');
	this.folded = true;
	this.talked = true;
	this.table.progress();
};

Player.prototype.bet = function(bet) {
	if (!this.SimpleBet(bet)) {
		return false;
	}
    
	this.talked = true;
	this.table.progress();
};

Player.prototype.raise = function(bet) {
	return this.bet(bet);
};

Player.prototype.callAmount = function() {
	var maxBet = this.table.getMaxBet(),
		currentBet = this.GetBet();

	return (maxBet - currentBet);
};


Player.prototype.call = function() {
	var callAmount = this.callAmount();
	if(callAmount <= 0){
		return this.check();
	}
	if (!this.SimpleBet(callAmount)) {
		return false;
	}

	this.talked = true;
	this.table.progress();
};

Player.prototype.allIn = function() {
	if (!this.SimpleBet(this.chips)) {
		return false;
	}
	console.log(this.table.getCurrentPlayerLabel() + ' All in');
    
	this.talked = true;
	this.table.progress();
};

Player.prototype.GetHand = function() {
	var cards = this.cards.concat(this.table.game.board);

	// {cards, rank, message} dans .hand
	return Result.rankHand({
		cards: cards
	});
};

Player.prototype.SetHand = function() {
	this.hand = this.GetHand();
};


module.exports = {
	Player: Player
};
