'use strict';

var Table = require('./table').Table;
var Player = require('./player').Player;

Table.prototype.getPlayerByName = function(playerName) {
    var found = false;
    var i = 0;

    while (i < this.players.length && !found) {
        if(this.players[i].playerName !== playerName) {
            i++;
        } else {
            found = true;
        }
    }
    return this.players[i];
};

Table.prototype.toJSON = function() {

    var table = {
        smallBlind     : this.smallBlind,
        bigBlind       : this.bigBlind,
        minPlayers     : this.minPlayers,
        maxPlayers     : this.maxPlayers,
        players        : [],
        dealer         : this.dealer,
        started        : this.started,
        isTestTable    : this.isTestTable,
        playersToRemove: [],
        playersToAdd   : [],
        gameWinners    : this.gameWinners || [],
        gameLosers     : [],
        game           : this.game || {}
    };

    if(typeof this.currentPlayer !== 'undefined') {
        table.currentPlayer = this.currentPlayer;
    }

    var getPlayers = function(list) {
        var result = [];

        if(list) {
            for (var i = 0; i < list.length; i++) {
                var player = list[i];

                if(player && player.playerName === 'Empty seat') {
                    result.push({
                        playerName: player.playerName
                    });
                } else if(player && player.playerName !== 'Empty seat') {
                    result.push({
                        playerName: player.playerName,
                        chips     : player.chips,
                        folded    : player.folded,
                        allIn     : player.allIn,
                        talked    : player.talked,
                        isSeated  : player.isSeated,
                        cards     : player.cards
                    });
                }

            }
        }
        return result;
    };

    table.players = getPlayers(this.players);
    table.playersToRemove = getPlayers(this.playersToRemove);
    table.playersToAdd = getPlayers(this.playersToAdd);
    table.gameLosers = getPlayers(this.gameLosers);

    return table;
};

/**
 * UTILS
 */
var getMinPlayers = function(players) {
    var tot = 0;

    players.forEach(function() {
        tot++;
    });

    return tot;
};

/**
 * get new game
 */
var getNew = function(params, players) {
    var table;

    // create game
    // Table params : smallBlind, bigBlind, minPlayers, maxPlayers
    // add players
    var minPlayers = getMinPlayers(players);

    // TODO make a tournament mode
    table = new Table(params.minBlind,
        params.maxBlind,
        minPlayers,
        params.maxPlayers);

    // add players
    players.forEach(function(player, $index) {
        var playerName = player.uid;
        table.AddPlayer({
            playerName: playerName,
            chips     : params.defaultStack,
            position  : $index
        });
    });

    return table;
};

/**
 * import full game
 */
var load = function(data) {

    // create game
    // Table params : smallBlind, bigBlind, minPlayers, maxPlayers
    var smallBlind = data.smallBlind,
        bigBlind = data.bigBlind,
        minPlayers = data.minPlayers,
        maxPlayers = data.maxPlayers;

    // create new game
    var table = new Table(smallBlind, bigBlind, minPlayers, maxPlayers);

    var restorePlayer = function(playersData, table) {
        var player = new Player({
            playerName: playersData.playerName,
            chips     : playersData.chips,
            table     : table
        });

        player.folded = playersData.folded;
        player.allIn = playersData.allIn;
        player.talked = playersData.talked;
        player.isSeated = playersData.isSeated;
        player.cards = playersData.cards;

        return player;
    };

    // add players
    if(data.players) {
        for (var i = 0; i < data.players.length; i++) {
            var playersData = data.players[i];
            if(playersData) {
                table.players.push(restorePlayer(playersData, table));
            }
        }
    }

    // restore current player
    table.currentPlayer = data.currentPlayer;

    // set dealer
    table.dealer = data.dealer;

    // restore gameWinners
    table.gameWinners = data.gameWinners || [];

    // restore gameLosers
    if(data.gameLosers) {
        for (var j = 0; j < data.gameLosers.length; j++) {
            var losersData = data.players[j];
            if(losersData) {
                table.gameLosers.push(restorePlayer(losersData, table));
            }
        }
    }

    // restore playersToRemove
    if(data.playersToRemove) {
        for (var k = 0; k < data.playersToRemove.length; k++) {
            var removesData = data.players[k];
            if(removesData) {
                table.playersToRemove.push(restorePlayer(removesData, table));
            }
        }
    }

    // restore playersToAdd
    if(data.playersToAdd) {
        for (var l = 0; l < data.playersToAdd.length; l++) {
            var addsData = data.players[l];
            if(addsData) {
                table.playersToAdd.push(restorePlayer(addsData, table));
            }
        }
    }

    // restore game
    table.game = data.game;
    table.game.board = table.game.board || [];
    table.game.bets = table.game.bets || [];

    return table;
};


module.exports.getNew = getNew;
module.exports.import = load;