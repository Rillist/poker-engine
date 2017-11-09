'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var unshuffled_deck = [
	'AS', 'KS', 'QS', 'JS', 'TS', '9S', '8S', '7S', '6S', '5S', '4S', '3S', '2S',
	'AH', 'KH', 'QH', 'JH', 'TH', '9H', '8H', '7H', '6H', '5H', '4H', '3H', '2H',
	'AD', 'KD', 'QD', 'JD', 'TD', '9D', '8D', '7D', '6D', '5D', '4D', '3D', '2D',
	'AC', 'KC', 'QC', 'JC', 'TC', '9C', '8C', '7C', '6C', '5C', '4C', '3C', '2C'
];
var Deck = /** @class */ (function () {
	function Deck() {
		this.cards = unshuffled_deck;
	}
	Deck.prototype.shuffle = function () {
		this.cards = unshuffled_deck.slice();
		var i;
		var j;
		var tempi;
		var tempj;
		for (i = 0; i < this.cards.length; i++) {
			j = Math.floor(Math.random() * (i + 1));
			tempi = this.cards[i];
			tempj = this.cards[j];
			this.cards[i] = tempj;
			this.cards[j] = tempi;
		}
		return this;
	};
	Deck.prototype.burn = function (count) {
		if (count === void 0) { count = 1; }
		for (var i = 1; i <= count && i <= this.cards.length; i++) {
			this.cards.pop();
		}
		return this;
	};
	Deck.prototype.deal = function (count, burn, cb) {
		if (count === void 0) { count = 1; }
		if (burn === void 0) { burn = false; }
		if (burn) {
			this.burn();
		}
		var dealtCards = new Array();
		for (var i = 1; i <= count && i <= this.cards.length; i++) {
			// dumb hack, can't push undefined but can pop it...
			// cards.length check prevents this anyway.
			dealtCards.push(this.cards.pop() || 'undefined');
		}
		if (cb) {
			cb(dealtCards);
		}
		return this;
	};
	return Deck;
}());
exports.Deck = Deck;
