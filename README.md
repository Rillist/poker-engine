## Node-Poker
Event based poker engine for node.


## Usage:
```js
var Poker = require("node-poker");

// pass init parameters, and optional array of players to initialize a table
var table = poker.newTable({
	minBlind: 10,
	maxBlind: 20,
	maxPlayers : 6
},[
	{
		playerName : "johnnyboy",
		chips: 100
	},
	{
		playerName : "bobbyboy",
		chips: 200
	},
]); 

// or add a player when you need it
table.addPlayer({
	playerName : "robbyboy",
	chips: 300
});


// start a table!
table.StartGame();
```

## Events:
```js
table.on("turn",function(player){
	player.Call();
});

table.on("gameOver",function(){
	table.initNewRound()
});
```