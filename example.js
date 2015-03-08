var poker = require("./index");
var table = poker.getNew({
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

/* DOESNT WORK
game.AddPlayer();
*/



table.on("turn",function(player){
	player.Call();
});


table.on("gameOver",function(){table.initNewRound()});

table.StartGame();


//console.log(table);


/*
table.players[1].Call();

table.players[0].Bet(10);
table.players[1].Call(10);

table.players[0].Bet(10);
table.players[1].Call(10);

table.players[0].Bet(10);
table.players[1].Call(10);

table.players[0].Bet(10);
table.players[1].Bet(10);

table.players[0].Bet(10);
table.players[1].Bet(10);

*/