import { BIG_BLIND, MIN_PLAYERS, SMALL_BLIND } from './defaults';
import { Player } from './player';
import { Table } from './table';

export class Game {
	pot = 0;
	round: RoundName = RoundName.Deal;
	board: string[] = new Array<string>();
	bets: number[] = new Array<number>();
	roundBets: number[] = new Array<number>();
	started = false;
	table: Table;
	constructor(table: Table) {
		this.table = table;
	}
	public start(): Game {
		if (this.started) {
			this.table.emit('startFailed', 'already started');
			return this;
		}
		if (this.NonEmptyPlayerCount() >= MIN_PLAYERS) {
			this.started = true;
			this.newRound();
			this.table.emit('gameStarted', this);
			return this;
		} else {
			this.table.emit('startFailed', 'not enough players');
		}
		return this;
	}
	public progressRound(): Game {
		if (this.table.allPlayersTalked()) {
			this.table.moveBetsToPot();
			if (this.table.allActivePlayersAreAllIn() || this.round === RoundName.River) {
				this.setRound(RoundName.Showdown);
			} else if (this.round === RoundName.Turn) {
				this.setRound(RoundName.River);
			} else if (this.round === RoundName.Flop) {
				this.setRound(RoundName.Turn);
			} else if (this.round === RoundName.Preflop) {
				this.setRound(RoundName.Flop);
			} else if (this.round === RoundName.Deal) {
				this.setRound(RoundName.Preflop);
			}
		} else {
			this.nextTurn();
		}
		return this;
	}

	setRound(round: RoundName): Game {
		this.round = round;
		switch (round) {
			case RoundName.Deal:
				break;
			case RoundName.Flop:
				this.table.resetActedState();
				this.table.deck.deal(3, true, (cards) => {
					this.board = this.board.concat(cards);
					this.table.forEachNonEmptyPlayer((p) => {
						p.SetHand();
					});
					this.table.emit(
						'flopRoundCompleted',
						this.board
					);
					this.table.setNextTurnToSmallBlind();
				});
				break;
			case RoundName.Turn:
				this.table.resetActedState();
				this.table.deck.deal(1, true, (cards) => {
					this.board = this.board.concat(cards);
					this.table.forEachNonEmptyPlayer((p) => {
						p.SetHand();
					});
					this.table.emit(
						'turnRoundCompleted',
						this.board
					);
					this.table.setNextTurnToSmallBlind();
				});
				break;
			case RoundName.River:
				this.table.resetActedState();
				this.table.deck.deal(1, true, (cards) => {
					this.board = this.board.concat(cards);
					this.table.forEachNonEmptyPlayer((p) => {
						p.SetHand();
					});
					this.table.emit(
						'riverRoundCompleted',
						this.board
					);
					this.table.setNextTurnToSmallBlind();
				});
				break;
			case RoundName.Showdown:
				this.table.dealMissingCards();
				this.table.forEachNonEmptyPlayer((p) => {
					p.SetHand();
				});
				this.table.checkForWinner();
				this.table.checkForBankrupt();
				setImmediate(() => {
					this.table.emit('gameOver');
				});
				break;
			default:
				break;
		}
		return this;
	}

	newRound(): Game {
		this.table.deck.shuffle();
		return this.resetBets()
			.assignBlinds()
			.payBlinds()
			.dealCards()
			.nextTurn();
	}

	nextTurn(): Game {
		this.table.currentPlayerIndex = this.table.getNextPlayerIndex(this.table.currentPlayerIndex, true);

		// todo: maybe emit player options like check, bet, fold
		this.table.emit('nextTurn',
			this.table.players[this.table.currentPlayerIndex],
		);

		return this;
	}

	dealCards(): Game {
		// Deal 1 card at a time, 2 off the top is not correct
		const dealOneCardToPlayer = (p: Player) => {
			this.table.deck.deal(1, false, (dealtCards) => {
				p.cards = p.cards.concat(dealtCards);
				p.SetHand();
			});
		};
		// Deal 2 cards to each non-empty player
		this.table
			.forEachNonEmptyPlayer(dealOneCardToPlayer)
			.forEachNonEmptyPlayer(dealOneCardToPlayer);

		this.table.emit(
			'dealRoundCompleted',
			this.table.players[this.table.dealerIndex],
			this
		);
		return this;
	}

	resetBets(): Game {
		this.bets = new Array<number>(this.table.players.length);
		this.roundBets = new Array<number>(this.table.players.length);

		return this;
	}

	assignBlinds(): Game {
		if (this.NonEmptyPlayerCount() > 2) {
			this.table.smallBlindIndex = this.table.getNextPlayerIndex(this.table.dealerIndex);
		} else {
			this.table.smallBlindIndex = this.table.dealerIndex;
		}
		this.table.bigBlindIndex = this.table.getNextPlayerIndex(this.table.smallBlindIndex);

		return this;
	}

	payBlinds(): Game {
		this.table.currentPlayerIndex = this.table.smallBlindIndex;
		this.table
			.players[this.table.currentPlayerIndex]
			.SimpleBet(this.table.smallBlind, true);

		if (!this.table.players[this.table.currentPlayerIndex].allIn) {
			this.table.players[this.table.currentPlayerIndex].acted = false;
		}

		this.table.emit(
			'smallBlindPaid',
			this.table.players[this.table.smallBlindIndex],
			this.table.smallBlind
		);

		// REFACTOR: opportunity, only diff here is big blind
		this.table.currentPlayerIndex = this.table.bigBlindIndex;
		this.table
			.players[this.table.currentPlayerIndex]
			.SimpleBet(this.table.bigBlind, true);

		if (!this.table.players[this.table.currentPlayerIndex].allIn) {
			this.table.players[this.table.currentPlayerIndex].acted = false;
		}

		this.table.emit(
			'bigBlindPaid',
			this.table.players[this.table.bigBlindIndex],
			this.table.bigBlind
		);
		// END REFACTOR
		return this;
	}

	NonEmptyPlayerCount(): number {
		let totalActivePlayers = 0;
		if (!this.table)	{
			return totalActivePlayers;
		}
		this.table.forEachNonEmptyPlayer(() => {
			totalActivePlayers++;
		});
		return totalActivePlayers;
	}

	SetBet(playerIndex: number, betAmount: number): Game {
		for (let i = 0; i <= playerIndex; i++) {
			this.bets[i] = this.bets[i] || 0;
		}
		this.bets[playerIndex] = this.bets[playerIndex] + betAmount;
		return this;
	}
	SetRoundBet(playerIndex: number, betAmount: number): Game {
		for (let i = 0; i <= playerIndex; i++) {
			this.roundBets[i] = this.roundBets[i] || 0;
		}
		this.roundBets[playerIndex] = this.roundBets[playerIndex] + betAmount;
		return this;
	}
}

export enum RoundName {
	Deal = 'Deal',
	Preflop = 'Preflop',
	Flop = 'Flop',
	Turn = 'Turn',
	River = 'River',
	Showdown = 'Showdown'
}