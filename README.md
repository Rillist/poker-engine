## Node-Poker
Event based poker engine for node.


## Usage:
```js
var Poker = require("node-poker");

var table = Poker.newTable({
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
	{
		playerName : "robbyboy",
		chips: 300
	}
]); 
table.StartGame();
```

##Event:
```js
table.on("turn",function(player){
	player.Call();
});

table.on("gameOver",function(){
	table.initNewRound()
});
```