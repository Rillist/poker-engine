'use strict';

var Player = require('./player.js').Player;
var Result = require('./result.js').Result;
var Game = require('./game.js').Game;

function Table(smallBlind, bigBlind, minPlayers, maxPlayers) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.minPlayers = minPlayers;
    this.maxPlayers = maxPlayers;
    this.players = [];
    this.currentPlayer = 0;
    this.started = false;
    this.isTestTable = false;
    this.dealer = 0; //Track the dealer position between games

    //Validate acceptable value ranges.
    var err;
    if(minPlayers < 2) { //require at least two players to start a game.
        err = new Error(101, 'Parameter [minPlayers] must be a postive integer of a minimum value of 2.');
    } else if(maxPlayers > 10) { //hard limit of 10 players at a table.
        err = new Error(102, 'Parameter [maxPlayers] must be a positive integer less than or equal to 10.');
    } else if(minPlayers > maxPlayers) { //Without this we can never start a game!
        err = new Error(103, 'Parameter [minPlayers] must be less than or equal to [maxPlayers].');
    }

    if(err) {
        return err;
    }
}

Table.prototype.fillDeck = function() {
    var deck = [];
    deck.push('AS');
    deck.push('KS');
    deck.push('QS');
    deck.push('JS');
    deck.push('TS');
    deck.push('9S');
    deck.push('8S');
    deck.push('7S');
    deck.push('6S');
    deck.push('5S');
    deck.push('4S');
    deck.push('3S');
    deck.push('2S');
    deck.push('AH');
    deck.push('KH');
    deck.push('QH');
    deck.push('JH');
    deck.push('TH');
    deck.push('9H');
    deck.push('8H');
    deck.push('7H');
    deck.push('6H');
    deck.push('5H');
    deck.push('4H');
    deck.push('3H');
    deck.push('2H');
    deck.push('AD');
    deck.push('KD');
    deck.push('QD');
    deck.push('JD');
    deck.push('TD');
    deck.push('9D');
    deck.push('8D');
    deck.push('7D');
    deck.push('6D');
    deck.push('5D');
    deck.push('4D');
    deck.push('3D');
    deck.push('2D');
    deck.push('AC');
    deck.push('KC');
    deck.push('QC');
    deck.push('JC');
    deck.push('TC');
    deck.push('9C');
    deck.push('8C');
    deck.push('7C');
    deck.push('6C');
    deck.push('5C');
    deck.push('4C');
    deck.push('3C');
    deck.push('2C');

    return this.shuffle(deck);
};

Table.prototype.shuffle = function(deck) {
    //Shuffle the deck array with Fisher-Yates
    var i,
        j,
        tempi,
        tempj;

    for (i = 0; i < deck.length; i++) {
        j = Math.floor(Math.random() * (i + 1));
        tempi = deck[i];
        tempj = deck[j];
        deck[i] = tempj;
        deck[j] = tempi;
    }
    return deck;
};

Table.prototype.getMaxBet = function() {
    var bets = this.game.bets;
    var maxBet = 0;

    for (var i = 0; i < bets.length; i++) {
        if(bets[i] > maxBet) {
            maxBet = bets[i];
        }
    }
    return maxBet;
};

Table.prototype.isEndOfRound = function() {
    var endOfRound = true,
        i = 0;

    //For each player, check
    while (endOfRound && i < this.players.length) {

        if(!this.players[i].talked) {

            endOfRound = false;

        } else {
            i++;
        }
    }

    return endOfRound;
};

Table.prototype.getAllInWinners = function(winners) {
    var allInPlayer = [];

    for (var i = 0; i < winners.length; i++) {
        var winner = winners[i];

        if(this.players[winner].allIn) {
            allInPlayer.push(winner);
        }
    }
    return allInPlayer;
};

Table.prototype.displayBankrolls = function() {
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        console.log('Player ' + player.playerName + ' now has ' + player.chips);
    }
};

Table.prototype.checkForWinner = function() {
    var i, j, l, maxRank, winners, part, prize, allInPlayer, minBets, roundEnd;
    //Identify winner(s)
    winners = [];
    maxRank = 0.000;
    for (var k = 0; k < this.players.length; k++) {
        var player = this.players[k];
        var playerRank = player.hand.rank;
        if(player.folded) {
            continue;
        }
        if(playerRank === maxRank) {
            winners.push(k);
        }
        if(playerRank > maxRank) {
            maxRank = playerRank;
            winners = [k];
        }
    }

    part = 0;
    prize = 0;
    allInPlayer = this.getAllInWinners(winners);
    var roundBet = null;
    if(allInPlayer.length > 0) {
        minBets = this.game.roundBets[winners[0]];
        for (j = 1; j < allInPlayer.length; j += 1) {
            roundBet = this.game.roundBets[winners[j]];
            if(roundBet !== 0 && roundBet < minBets) {
                minBets = roundBet;
            }
        }
        part = parseInt(minBets, 10);
    } else {
        part = parseInt(this.game.roundBets[winners[0]], 10);
    }
    for (l = 0; l < this.game.roundBets.length; l += 1) {
        roundBet = this.game.roundBets[l];
        if(roundBet > part) {
            prize += part;
            this.game.roundBets[l] -= part;
        } else {
            prize += roundBet;
            this.game.roundBets[l] = 0;
        }
    }

    for (i = 0; i < winners.length; i++) {
        var winner = this.players[winners[i]];
        var won = prize / winners.length;
        winner.chips += won;
        console.log('adding ' + won + ' chips to ' + winner.playerName);
        if(this.game.roundBets[winners[i]] === 0) {
            winner.folded = true;
        }
        console.log('player ' + winner.playerName + ' wins with ' + winner.hand.message + '(cartes: ' + winner.hand.cards + ', valeur ' + winner.hand.rank + ')');
    }

    roundEnd = true;
    for (l = 0; l < this.game.roundBets.length; l += 1) {
        if(roundBet !== 0) {
            roundEnd = false;
        }
    }
    if(!roundEnd) {
        this.checkForWinner();
    } else {
        this.displayBankrolls();
        if(this.isTestTable) {
            this.initNewRound();
            return;
        }
        // tour terminé, on attend 10 secondes pour permettre au client de se mettre à jour
        var that = this;
        setTimeout(function() {
            that.initNewRound();
        }, 10000);
    }
};

Table.prototype.checkForBankrupt = function() {
    for (var i = this.players.length - 1; i >= 0; i--) {

        if(this.players[i].chips === 0) {
            console.log('player ' + this.players[i].playerName + ' is going bankrupt');
            this.players.splice(i, 1);
        }
    }
};


Table.prototype.progress = function() {
    var i, j, cards;
    var isEndOfRound = this.isEndOfRound();
    if(!isEndOfRound) {
        return;
    }
    //Move all bets to the pot
    for (i = 0; i < this.game.bets.length; i += 1) {
        this.game.pot += parseInt(this.game.bets[i], 10);
        this.game.roundBets[i] += parseInt(this.game.bets[i], 10);
    }
    if(this.game.roundName === 'River') {
        this.game.roundName = 'Showdown';
        this.game.bets = [];
        //Evaluate each hand
        for (j = 0; j < this.players.length; j += 1) {
            // récupération des 5 cartes du milieu et des 2 cartes du joueur
            cards = this.players[j].cards.concat(this.game.board);
            // {cards, rank, message} dans .hand
            this.players[j].hand = Result.rankHand({cards: cards});
        }
        this.checkForWinner();
        this.checkForBankrupt();
    } else if(this.game.roundName === 'Turn') {
        console.log('effective turn');
        this.game.roundName = 'River';
        this.game.deck.pop(); //Burn a card
        this.game.board.push(this.game.deck.pop()); //Turn a card
        //this.game.bets.splice(0,this.game.bets.length-1);
        for (i = 0; i < this.game.bets.length; i += 1) {
            this.game.bets[i] = 0;
        }
        for (i = 0; i < this.players.length; i += 1) {
            this.players[i].talked = false;
        }
    } else if(this.game.roundName === 'Flop') {
        console.log('effective flop');
        this.game.roundName = 'Turn';
        this.game.deck.pop(); //Burn a card
        this.game.board.push(this.game.deck.pop()); //Turn a card
        for (i = 0; i < this.game.bets.length; i += 1) {
            this.game.bets[i] = 0;
        }
        for (i = 0; i < this.players.length; i += 1) {
            this.players[i].talked = false;
        }
    } else if(this.game.roundName === 'Deal') {
        console.log('effective deal');
        this.game.roundName = 'Flop';
        this.game.deck.pop(); //Burn a card
        for (i = 0; i < 3; i += 1) { //Turn three cards
            this.game.board.push(this.game.deck.pop());
        }
        //this.game.bets.splice(0,this.game.bets.length-1);
        for (i = 0; i < this.game.bets.length; i += 1) {
            this.game.bets[i] = 0;
        }
        for (i = 0; i < this.players.length; i += 1) {
            this.players[i].talked = false;
        }
    }
};

Table.prototype.getNextPlayerIndex = function(currentIndex) {
    var found = false;

    while (!found) {
        currentIndex++;
        currentIndex = currentIndex < this.players.length ? currentIndex : 0;

        if(this.players[currentIndex].playerName !== 'Empty seat') {
            found = true;
        }
    }

    return currentIndex;
};

Table.prototype.initNewRound = function() {
    console.log('initNewRound ...');

    // TODO move bid blind instead of dealer
    this.dealer = this.getNextPlayerIndex(this.dealer);

    this.game.pot = 0;
    this.game.roundName = 'Deal'; //Start the first round
    this.game.betName = 'bet'; //bet,raise,re-raise,cap
    this.game.bets = [];
    this.game.board = [];

    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        player.folded = false;
        player.talked = false;
        player.allIn = false;
        player.cards = [];
    }

    this.game.deck = this.fillDeck();
    this.NewRound();
};

Table.prototype.GetPlayersIndexes = function() {
    var table = [];
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if(player.playerName !== 'Empty seat') {
            table.push(i);
        }
    }
    return table;
};

var getRandomBetween = function(min, max) {
    return Math.floor(Math.random() * max) + min;
};

Table.prototype.GetFirstDealer = function() {
    var indexes = this.GetPlayersIndexes();
    var random = getRandomBetween(0, indexes.length - 1);
    return indexes[random];
};

Table.prototype.StartGame = function() {
    console.log('starting game ...');

    if(this.started) {
        console.log('already started ...');
        return;
    }

    //If there is no current game and we have enough players, start a new game.
    if(!this.game && this.GetIngamePlayersLength() >= this.minPlayers) {
        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            if(!player) {
                player = this.getNonSeatedPlayer();
                this.players[i] = player;
            }
        }
        this.game = new Game(this.smallBlind, this.bigBlind);

        this.dealer = this.GetFirstDealer();
        this.started = true;
        this.NewRound();
    }
};

Table.prototype.getCurrentPlayerLabel = function() {
    var player = this.getCurrentPlayer();
    return '[' + this.currentPlayer + ' - ' + player.playerName + '] ';
};

Table.prototype.getCurrentPlayer = function() {
    return this.players[this.currentPlayer];
};

Table.prototype.getNonSeatedPlayer = function() {
    return new Player({
        playerName: 'Empty seat',
        table     : this
    });
};

Table.prototype.AddPlayer = function(options) {
    if(!options.playerName) {
        console.log('playName is not defined');
        return;
    }
    var position = options.position;

    console.log('adding player ' + options.playerName + ' at position ' + options.position);
    options.table = this;
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if(player && player.playerName === options.playerName) {
            this.players[i] = this.getNonSeatedPlayer();
            break;
        }
    }
    var playerSeated = new Player(options);
    playerSeated.isSeated = true;
    this.players[position] = playerSeated;
};

Table.prototype.RemovePlayer = function(playerName) {
    var player = this.getPlayerByName(playerName);
    var playerIndex = player.GetIndex();
    this.players[playerIndex] = this.getNonSeatedPlayer();
};

Table.prototype.NewRound = function() {
    this.game.deck = this.fillDeck();
    var i, smallBlind, bigBlind;
    //Deal 2 cards to each player
    var nbPlayers = this.players.length;
    for (i = 0; i < nbPlayers; i += 1) {
        // only deal cards to real player
        if(!this.players[i].isEmptySeat) {
            this.players[i].cards.push(this.game.deck.pop());
            this.players[i].cards.push(this.game.deck.pop());
        }
        this.game.bets[i] = 0;
        this.game.roundBets[i] = 0;
    }

    //Identify Small and Big Blind player indexes
    if(this.GetIngamePlayersLength() > 2) {
        smallBlind = this.getNextPlayerIndex(this.dealer);
    } else {
        smallBlind = this.dealer;
    }
    bigBlind = this.getNextPlayerIndex(smallBlind);


    //Force Blind Bets
    this.players[smallBlind].SimpleBet(this.smallBlind);
    this.players[bigBlind].SimpleBet(this.bigBlind);

    this.currentPlayer = this.getNextPlayerIndex(bigBlind);
};

Table.prototype.GetIngamePlayersLength = function() {
    var tot = 0;
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if(player && player.playerName !== 'Empty seat') {
            tot++;
        }
    }
    return tot;
};

Table.prototype.NextPlayer = function() {
    this.currentPlayer = this.getNextPlayerIndex(this.currentPlayer);
    console.log('current player is ' + this.currentPlayer);
};

module.exports.Table = Table;


