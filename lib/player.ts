import { EMPTY_SEAT_NAME } from './defaults';
import { Hand, HandEvaluator } from './hand-evaluator';
import { Table } from './table';

export class Player {
	table: Table;
	playerName: string = EMPTY_SEAT_NAME;
	cards: string[] = new Array<string>();
	hand = new Hand({cards: this.cards});
	chips = 0;
	prize = 0;
	folded = false;
	allIn = false;
	acted = false;
	seated = false;
	static EmptySeat(table?: Table): Player {
		const nonSeatedPlayer = new Player();
		if (table) {
			nonSeatedPlayer.table = table;
		}
		return nonSeatedPlayer;
	}
	constructor(options?: {playerName?: string, chips?: number})
	constructor(options: PlayerOptions = new PlayerOptions()) {
		this.playerName = options && options.playerName ? options.playerName : EMPTY_SEAT_NAME;
		this.chips = options && options.chips ? options.chips : 0;
	}
	empty(): boolean {
		return this.playerName === EMPTY_SEAT_NAME;
	}

	SimpleBet(bet: number, isBlind?: boolean): boolean {
		if (!this.isTurn()) {
			return false;
		}

		// not sure why reffing table, this.table.players[index].chips
		// when chips var on this object (this.chips)
		// test and fix if not needed
		const index = this.getIndex();
		const protectedBet = bet <= this.table.players[index].chips
			? bet
			: this.table.players[index].chips;

		const callAmount = this.callAmount();
		if (bet < callAmount) {
			this.table.emit('invalidBet', 'did not meet call amount', callAmount, bet);
			return false;
		}

		this.table.game.SetBet(index, protectedBet);
		this.table.players[index].chips = this.table.players[index].chips - protectedBet;
		this.acted = true;

		if (this.table.players[index].chips <= 0) {
			this.allIn = true;
		}

		if (!isBlind && bet > callAmount) {
			this.table.emit('playerBet',
				protectedBet,
				this
			);
			if (callAmount > 0) {
				this.table.emit('playerRaised',
					bet - callAmount,
					this
				);
			}
			this.table.forEachNonEmptyPlayer((p: Player) => {
				if (!p.folded && !p.allIn && p.GetBet() < this.table.getMaxBet()) {
					p.acted = false;
				}
			});
		} else if (bet === callAmount) {
			this.table.emit('playerCalled',
				callAmount,
				this
			);
		} else if (!isBlind) {
			this.table.emit('playerBet',
				protectedBet,
				this
			);
		}

		return true;
	}

	callAmount(): number {
		const maxBet = this.table.getMaxBet();
		const currentBet = this.GetBet();
		return (maxBet - currentBet);
	}

	GetBet(): number {
		const index = this.getIndex();
		return this.table.game.bets[index] || 0;
	}

	isTurn(): boolean {
		if (this.table.currentPlayerIndex !== this.getIndex()) {
			// interesting...
			// copy paste gives idea to emit events from related models
			this.table.emit('wrongTurn', {
				shouldBe: this.table.currentPlayerIndex,
				violator: this.getIndex()
			});

			return false;
		}
		return true;
	}

	call(): boolean {
		const callAmount = this.callAmount();
		if (callAmount <= 0) {
			return this.check();
		}

		if (!this.SimpleBet(callAmount)) {
			return false;
		}

		this.acted = true;
		this.table.progress();
		return true;
	}

	check(): boolean {
		if (!this.isTurn()) {
			return false;
		}
		const callAmount = this.callAmount();
		if (callAmount > 0) {
			this.table.emit('invalidCheck', 'must call the current bet', callAmount);
			return false;
		}
		this.table.emit('playerChecked',
			this
		);
		this.acted = true;
		this.table.progress();
		return true;
	}

	getIndex(): number {
		let found = false;
		let i = 0;

		while (i < this.table.players.length && !found) {
			if (this !== this.table.players[i]) {
				i++;
			} else {
				found = true;
			}
		}

		return i;
	}

	SetHand(): Player {
		this.hand.cards = this.cards.concat(this.table.game.board);
		this.hand = HandEvaluator.evalHand(this.hand);
		return this;
	}

	bet(bet: number): boolean {
		if (!this.SimpleBet(bet)) {
			return false;
		}

		this.acted = true;
		this.table.progress();
		return true;
	}

	raise(bet: number): boolean {
		return this.bet(bet);
	}

	fold(): Player {
		if (!this.isTurn()) {
			return this;
		}

		this.folded = true;
		this.acted = true;
		this.table.emit('playerFolded',
			this
		);
		this.table.progress();
		return this;
	}
}

export class PlayerOptions {
	playerName: string;
	chips: number;
	constructor(options?: { playerName?: string, chips?: number }) {
		this.playerName = options && options.playerName || EMPTY_SEAT_NAME;
		this.chips = options && options.chips || 0;
	}
}
