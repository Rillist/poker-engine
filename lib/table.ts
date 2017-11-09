
import events = require('typescript.events');
import { Deck } from './deck';
import { BIG_BLIND, EMPTY_SEAT_NAME, MAX_PLAYERS, SMALL_BLIND } from './defaults';
import { Game, RoundName } from './game';
import { Player, PlayerOptions } from './player';

export class Table extends events.Event {
	smallBlind: number = SMALL_BLIND;
	bigBlind: number = BIG_BLIND;
	players: Player[];
	maxPlayers: number;
	currentPlayerIndex = 0;
	dealerIndex = 0;
	smallBlindIndex = 0;
	bigBlindIndex = 0;
	game: Game;
	deck: Deck = new Deck().shuffle();
	constructor(options: TableOptions = new TableOptions()) {
		super();
		this.smallBlind = options.smallBlind;
		this.bigBlind = options.bigBlind;
		this.players = options.players || new Array<Player>();
		this.maxPlayers = options.maxPlayers;
	}
	forEachNonEmptyPlayer(fn: (p: Player, i: number, arr: Player[]) => any): Table {
		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i] && !this.players[i].empty()) {
				fn(this.players[i], i, this.players);
			}
		}
		return this;
	}
	startGame(): Table {
		this.game = new Game(this);
		this.game.start();
		return this;
	}
	initNewRound(): Table {
		this.game.pot = 0;
		this.setStep(RoundName.Deal);

		this.game.bets = [];
		this.game.board = [];
		for (const player of this.players) {
			player.folded = false;
			player.acted = false;
			player.allIn = false;
			player.cards = new Array<string>();
			player.SetHand();
			player.prize = 0;
		}

		this.dealerIndex = this.getNextPlayerIndex(this.dealerIndex);

		this.deck.shuffle();
		this.game.newRound();

		return this;
	}
	fixEmptySeats(): Table {
		// TODO:
		// Not sure why this is necessary, research it...
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (!player) {
				this.players[i] = Player.EmptySeat(this);
			}
		}
		return this;
	}
	getNextPlayerIndex(currentIndex = -1, findActor = false): number {
		let found = false;
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
	}
	getMaxBet(): number {
		const bets = this.game.bets;
		let maxBet = 0;

		for (const bet of bets) {
			if (bet && bet > maxBet) {
				maxBet = bet;
			}
		}
		return maxBet;
	}
	addPlayer(playerOptions: {playerName: string, chips?: number}): Table;
	addPlayer(playerOrOptions: Player | PlayerOptions): Table {
		let player = new Player();
		if (playerOrOptions && playerOrOptions instanceof Player) {
			player = playerOrOptions as Player;
		} else /*if (playerOrOptions && playerOrOptions instanceof PlayerOptions)*/ {
			player = new Player(playerOrOptions as PlayerOptions);
		}

		if (player.playerName === EMPTY_SEAT_NAME) {
			this.emit('addPlayerFailed', 'tried to add empty player');
			return this;
		}

		// remove previous position if player already seated on table
		for (let p of this.players) {
			if (p && p.playerName === player.playerName) {
				p = Player.EmptySeat(this);
				break;
			}
		}

		let position = 0;
		while (this.players[position] !== undefined) {
			position++;
		}
		player.seated = true;
		player.table = this;
		this.players[position] = player;
		this.emit('addedPlayer', player, position);

		return this;
	}

	progress(): Table {
		if (this.allPlayersTalked()) {
			this.moveBetsToPot();
			if (this.allActivePlayersAreAllIn() || this.game.round === RoundName.River) {
				this.setStep(RoundName.Showdown);
			} else if (this.game.round === RoundName.Turn) {
				this.setStep(RoundName.River);
			} else if (this.game.round === RoundName.Flop) {
				this.setStep(RoundName.Turn);
			} else if (this.game.round === RoundName.Deal) {
				this.setStep(RoundName.Flop);
			}
		} else {
			this.game.nextTurn();
		}
		return this;
	}

	setStep(round: RoundName): Table {
		this.game.round = round;
		switch (round) {
			case RoundName.Deal:
				break;
			case RoundName.Flop:
				this.resetActedState();
				this.deck.deal(3, true, (cards) => {
					this.game.board = this.game.board.concat(cards);
					this.forEachNonEmptyPlayer((p) => {
						p.SetHand();
					});
					this.emit(
						'flopRoundCompleted',
						this.game.board
					);
					this.setNextTurnToSmallBlind();
				});
				break;
			case RoundName.Turn:
				this.resetActedState();
				this.deck.deal(1, true, (cards) => {
					this.game.board = this.game.board.concat(cards);
					this.forEachNonEmptyPlayer((p) => {
						p.SetHand();
					});
					this.emit(
						'turnRoundCompleted',
						this.game.board
					);
					this.setNextTurnToSmallBlind();
				});
				break;
			case RoundName.River:
				this.resetActedState();
				this.deck.deal(1, true, (cards) => {
					this.game.board = this.game.board.concat(cards);
					this.forEachNonEmptyPlayer((p) => {
						p.SetHand();
					});
					this.emit(
						'riverRoundCompleted',
						this.game.board
					);
					this.setNextTurnToSmallBlind();
				});
				break;
			case RoundName.Showdown:
				this.dealMissingCards();
				this.forEachNonEmptyPlayer((p) => {
					p.SetHand();
				});
				this.checkForWinner();
				this.checkForBankrupt();
				setImmediate(() => {
					this.emit('gameOver');
				});
				break;
			default:
				break;
		}
		return this;
	}

	checkForBankrupt(): Table {
		for (let i = this.players.length - 1; i >= 0; i--) {
			if (this.players[i].chips <= 0) {
				this.players[i].chips = 0;
				this.emit('playerBankrupt', this.players[i]);
				// TODO: remove bankrupt players from game, but allow to rebuy
			}
		}

		return this;
	}

	checkForWinner(): Table {
		// todo: run tests for side pots
		// not convinced this works 100%
		// GIVEN: player 1 all in, 100 chips, 3 of a kind (3s, 2 in board, A kicker)
		// AND: player 2 all in, 200 chips, 3 of a kind (3s, 2 in board, A kicker)
		// AND: player 3 not all in, 200 chips, 2 pair (2s & As)
		// WHEN: showdown for 500 chip pot (300 all, 200 player 2 & 3)
		// THEN: player 1 should get 150 (I think he may get 200 or even 300)
		// AND: player 2 should get 350 (probably gets the leftover)
		while (!this.roundEnd()) {
			const winners = this.GetWinnersIndexes();
			const allInWinners = this.getAllInWinners(winners);

			let part = 0;
			if (allInWinners.length > 0) {
				part = Math.round(this.getMinBets(allInWinners, winners));
			} else {
				part = Math.round(this.game.roundBets[winners[0]]);
			}

			const prize = this.makePrize(part);
			this.GivePrize(winners, prize);
		}

		return this;
	}

	GivePrize(winnersIndexes: number[], prize: number): Table {
		const won = prize / winnersIndexes.length;

		winnersIndexes.forEach((winnerIndex) => {
			const winner = this.players[winnerIndex];
			winner.prize = winner.prize + won;
			winner.chips = Math.round(winner.chips + won);

			if (this.game.roundBets[winnerIndex] === 0) {
				winner.folded = true;
			}
			this.emit('prizeWon', winner, won);
		});

		return this;
	}

	makePrize(part: number): number {
		let roundBet = null;
		let prize = 0;

		for (let l = 0; l < this.game.roundBets.length; l++) {
			roundBet = this.game.roundBets[l];
			if (roundBet > part) {
				prize = prize + part;
				this.game.roundBets[l] = this.game.roundBets[l] - part;
			} else {
				prize = prize + roundBet;
				this.game.roundBets[l] = 0;
			}
		}
		return prize;
	}

	getMinBets(allInWinners: number[], winners: number[]): number {
		let minBets = this.game.roundBets[winners[0]];

		for (let j = 1; j < allInWinners.length; j++) {
			const roundBet = this.game.roundBets[winners[j]];
			if (roundBet !== 0 && roundBet < minBets) {
				minBets = roundBet;
			}
		}

		return minBets;
	}

	getAllInWinners(winnersIndexes: number[]): number[] {
		const allInPlayers = new Array<number>();

		winnersIndexes.forEach((winnerIndex) => {
			if (this.players[winnerIndex].allIn) {
				allInPlayers.push(winnerIndex);
			}
		});

		return allInPlayers;
	}

	GetWinnersIndexes(): number[] {
		let winners = new Array<number>();
		let maxRank = 0.000;

		this.forEachNonEmptyPlayer((player, $index) => {
			const playerRank = player.hand.rank;
			if (!player.folded) {
				if (playerRank === maxRank && maxRank > 0) {
					winners.push($index);
					this.emit('playerTies', player);
				} else if (playerRank > maxRank) {
					maxRank = playerRank;
					winners = [$index];
					this.emit('playerWins', player);
				} else {
					this.emit('playerLoses', player);
				}
			}
		});

		return winners;
	}

	roundEnd(): boolean {
		let roundEnd = true;
		let i = 0;
		while (roundEnd && i < this.game.roundBets.length) {
			if (this.game.roundBets[i] !== 0) {
				roundEnd = false;
			}
			i++;
		}
		return roundEnd;
	}

	dealMissingCards(): Table {
		const missingCards = 5 - this.game.board.length;
		if (missingCards >= 3) {
			// flop 3 cards with a burn
			this.deck.deal(3, true, (cards) => {
				this.game.board = this.game.board.concat(cards);
			});
		}
		if (missingCards >= 2) {
			// turn 1 card with a burn
			this.deck.deal(1, true, (cards) => {
				this.game.board = this.game.board.concat(cards);
			});
		}
		if (missingCards >= 1) {
			// river 1 card with a burn
			this.deck.deal(1, true, (cards) => {
				this.game.board = this.game.board.concat(cards);
			});
		}
		return this;
	}

	setNextTurnToSmallBlind(): Table {
		// Used to set to dealerIndex, and jump to next turn
		// I think this is wrong, because when 2 players dealer is small blind
		this.currentPlayerIndex = this.smallBlindIndex - 1;
		this.game.nextTurn();
		return this;
	}

	resetActedState(): Table {
		this.forEachNonEmptyPlayer((player) => {
			player.acted = false;
		});
		return this;
	}

	moveBetsToPot(): Table {
		for (let i = 0; i < this.game.bets.length; i++) {
			const bet = Math.round(this.game.bets[i]);
			this.game.pot = this.game.pot + bet;
			this.game.SetRoundBet(i, bet);
			this.game.bets[i] = 0;
		}
		return this;
	}

	allPlayersTalked(): boolean {
		let endOfRound = true;
		let i = 0;
		// todo: seems like something like lodash can do this simpler
		// maybe port a method like any, or add dependency?
		// return players.any(!empty, !acted, !folded, !allIn)
		while (endOfRound && i < this.players.length) {
			if (!this.players[i].empty() && !this.players[i].acted && !this.players[i].folded && !this.players[i].allIn) {
				endOfRound = false;
			} else {
				i++;
			}
		}
		return endOfRound;
	}

	allActivePlayersAreAllIn(): boolean {
		let all = true;
		this.forEachNonEmptyPlayer((player) => {
			if (!player.allIn && !player.folded) {
				all = false;
			}
		});
		return all;
	}

	getCurrentPlayer(): Player {
		return this.players[this.currentPlayerIndex];
	}
}

export class TableOptions {
	smallBlind: number = SMALL_BLIND;
	bigBlind: number = BIG_BLIND;
	maxPlayers: number = MAX_PLAYERS;
	players: any[];
}
