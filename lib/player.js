'use strict';
var Result = require('./result.js').Result;

function Player(options) {
    this.playerName = options.playerName;
    this.chips = options.chips;
    this.folded = false;
    this.allIn = false;
    this.talked = false;
    this.isSeated = false;
    this.isEmptySeat = options.playerName === 'Empty seat';
    this.chips = 1000;
    this.table = options.table; //Circular reference to allow reference back to parent object.
    this.cards = [];
}

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

// Bet, support all in state
Player.prototype.SimpleBet = function(bet) {
    var index = this.getIndex();

    var protectedBet = bet <= this.table.players[index].chips ? bet : this.table.players[index].chips;

    this.table.game.bets[index] = this.table.game.bets[index] + protectedBet;
    this.table.players[index].chips = this.table.players[index].chips - protectedBet;

    if(this.table.players[index].chips <= 0) {
        this.allIn = true;
        console.log(this.table.getCurrentPlayerLabel() + ' is all in !');
    }
};

Player.prototype.GetBet = function() {
    var index = this.getIndex();
    return this.table.game.bets[index] || 0;
};


Player.prototype.Check = function() {
    console.log(this.table.getCurrentPlayerLabel() + ' checked');

    this.talked = true;
    this.table.progress();
};

Player.prototype.Fold = function() {
    console.log(this.table.getCurrentPlayerLabel() + ' folded');

    this.folded = true;
    this.talked = true;
    this.table.progress();
};

Player.prototype.Bet = function(bet) {
    console.log(this.table.getCurrentPlayerLabel() + ' bets ' + bet);
    this.SimpleBet(bet);
    this.talked = true;
    this.table.progress();
};

Player.prototype.Call = function() {
    console.log(this.table.getCurrentPlayerLabel() + ' called');

    var maxBet = this.table.getMaxBet(),
        currentBet = this.GetBet();

    this.SimpleBet(maxBet - currentBet);
    this.talked = true;
    this.table.progress();
};

Player.prototype.AllIn = function() {
    this.SimpleBet(this.chips);
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