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
```