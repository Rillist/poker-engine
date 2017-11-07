import events = require('typescript.events');

const unshuffled_deck: string[] = [
	'AS', 'KS', 'QS', 'JS', 'TS', '9S', '8S', '7S', '6S', '5S', '4S', '3S', '2S',
	'AH', 'KH', 'QH', 'JH',	'TH', '9H', '8H', '7H', '6H', '5H', '4H', '3H', '2H',
	'AD', 'KD', 'QD', 'JD', 'TD', '9D', '8D', '7D', '6D', '5D', '4D', '3D', '2D',
	'AC', 'KC', 'QC', 'JC', 'TC', '9C', '8C', '7C', '6C', '5C', '4C', '3C', '2C'
];

export class Deck extends events.Event {
	cards: string[] = unshuffled_deck;
	shuffle(): Deck {// Shuffle the deck array with Fisher-Yates
		this.cards = unshuffled_deck.slice();
		let i; let j; let tempi; let tempj;
		for (i = 0; i < this.cards.length; i++) {
			j = Math.floor(Math.random() * (i + 1));
			tempi = this.cards[i];
			tempj = this.cards[j];
			this.cards[i] = tempj;
			this.cards[j] = tempi;
		}
		return this;
	}
	burn(count = 1): Deck {
		for (let i = 1; i <= count && i <= this.cards.length; i++) {
			this.cards.pop();
		}
		return this;
	}
	deal(count = 1, burn = false, cb: (dealtCards: string[]) => any): Deck {
		if (burn) { this.burn(); }
		const dealtCards = new Array<string>();
		for (let i = 1; i <= count && i <= this.cards.length; i++) {
			// dumb hack, can't push undefined but can pop it...
			// cards.length check prevents this anyway.
		 	dealtCards.push(this.cards.pop() || 'undefined');
		}

		this.emit('dealtCards', dealtCards, count, burn, this);
		if (cb) { cb(dealtCards); }

		return this;
	}
}
