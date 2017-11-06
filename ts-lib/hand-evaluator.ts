
export class HandEvaluator {
	static sortNumeric = (a: number, b: number) => b - a;
	static evalHand(hand: Hand): Hand {
		const handRanks = new Array<string>();
		const handSuits = new Array<string>();
		for (let i = 0; i < hand.cards.length; i += 1) {
			handRanks[i] = hand.cards[i].substr(0, 1);
			handSuits[i] = hand.cards[i].substr(1, 1);
		}

		// todo: maybe research this?
		// no clue what this replace is for, or why not used on cards??
		const ranks = handRanks.sort().toString().replace(/\W/g, '');
		const suits = handSuits.sort().toString().replace(/\W/g, '');

		hand.rank = 0;
		if (hand.rank === 0) {
			hand = this.evalFourOfAKind(hand, ranks);
		}
		if (hand.rank === 0) {
			hand = this.evalFullHouse(hand, ranks);
		}
		if (hand.rank === 0) {
			hand = this.evalFlush(hand, suits);
			hand = this.evalStraightFlush(hand, ranks);
		}
		if (hand.rank === 0) {
			hand = this.evalStraight(hand, ranks);
		}
		if (hand.rank === 0) {
			hand = this.evalThreeOfAKind(hand, ranks);
		}
		if (hand.rank === 0) {
			hand = this.evalTwoPair(hand, ranks);
		}
		if (hand.rank === 0) {
			hand = this.evalOnePair(hand, ranks);
		}
		if (hand.rank === 0) {
			hand = this.evalHighCard(hand, ranks);
		}

		return hand;
	}

	static stringContainsAll(inputString: string, allChecks: string[]): boolean {
		for (const check in allChecks) {
			if (inputString.indexOf(check) === - 1) {
				return false;
			}
		}
		return true;
	}

	static evalFourOfAKind(hand: Hand, ranks: string): Hand {
		if (ranks.indexOf('AAAA') > -1) {
			hand.rank = 292 + this.evalKickers(ranks.replace('AAAA', ''), 1);
		} else if (ranks.indexOf('KKKK') > -1) {
			hand.rank = 291 + this.evalKickers(ranks.replace('KKKK', ''), 1);
		} else if (ranks.indexOf('QQQQ') > -1) {
			hand.rank = 290 + this.evalKickers(ranks.replace('QQQQ', ''), 1);
		} else if (ranks.indexOf('JJJJ') > -1) {
			hand.rank = 289 + this.evalKickers(ranks.replace('JJJJ', ''), 1);
		} else if (ranks.indexOf('TTTT') > -1) {
			hand.rank = 288 + this.evalKickers(ranks.replace('TTTT', ''), 1);
		} else if (ranks.indexOf('9999') > -1) {
			hand.rank = 287 + this.evalKickers(ranks.replace('9999', ''), 1);
		} else if (ranks.indexOf('8888') > -1) {
			hand.rank = 286 + this.evalKickers(ranks.replace('8888', ''), 1);
		} else if (ranks.indexOf('7777') > -1) {
			hand.rank = 285 + this.evalKickers(ranks.replace('7777', ''), 1);
		} else if (ranks.indexOf('6666') > -1) {
			hand.rank = 284 + this.evalKickers(ranks.replace('6666', ''), 1);
		} else if (ranks.indexOf('5555') > -1) {
			hand.rank = 283 + this.evalKickers(ranks.replace('5555', ''), 1);
		} else if (ranks.indexOf('4444') > -1) {
			hand.rank = 282 + this.evalKickers(ranks.replace('4444', ''), 1);
		} else if (ranks.indexOf('3333') > -1) {
			hand.rank = 281 + this.evalKickers(ranks.replace('3333', ''), 1);
		} else if (ranks.indexOf('2222') > -1) {
			hand.rank = 280 + this.evalKickers(ranks.replace('2222', ''), 1);
		}

		if (hand.rank !== 0) {hand.message = 'Four of a kind'; }
		return hand;
	}

	static evalFullHouse(hand: Hand, ranks: string): Hand {
		if (this.stringContainsAll(ranks, ['AAA', 'KK'])) { hand.rank = 279; } else
		if (this.stringContainsAll(ranks, ['AAA', 'QQ'])) { hand.rank = 278; } else
		if (this.stringContainsAll(ranks, ['AAA', 'JJ'])) { hand.rank = 277; } else
		if (this.stringContainsAll(ranks, ['AAA', 'TT'])) { hand.rank = 276; } else
		if (this.stringContainsAll(ranks, ['AAA', '99'])) { hand.rank = 275; } else
		if (this.stringContainsAll(ranks, ['AAA', '88'])) { hand.rank = 274; } else
		if (this.stringContainsAll(ranks, ['AAA', '77'])) { hand.rank = 273; } else
		if (this.stringContainsAll(ranks, ['AAA', '66'])) { hand.rank = 272; } else
		if (this.stringContainsAll(ranks, ['AAA', '55'])) { hand.rank = 271; } else
		if (this.stringContainsAll(ranks, ['AAA', '44'])) { hand.rank = 270; } else
		if (this.stringContainsAll(ranks, ['AAA', '33'])) { hand.rank = 269; } else
		if (this.stringContainsAll(ranks, ['AAA', '22'])) { hand.rank = 268; } else
		if (this.stringContainsAll(ranks, ['KKK', 'AA'])) { hand.rank = 267; } else
		if (this.stringContainsAll(ranks, ['KKK', 'QQ'])) { hand.rank = 266; } else
		if (this.stringContainsAll(ranks, ['KKK', 'JJ'])) { hand.rank = 265; } else
		if (this.stringContainsAll(ranks, ['KKK', 'TT'])) { hand.rank = 264; } else
		if (this.stringContainsAll(ranks, ['KKK', '99'])) { hand.rank = 263; } else
		if (this.stringContainsAll(ranks, ['KKK', '88'])) { hand.rank = 262; } else
		if (this.stringContainsAll(ranks, ['KKK', '77'])) { hand.rank = 261; } else
		if (this.stringContainsAll(ranks, ['KKK', '66'])) { hand.rank = 260; } else
		if (this.stringContainsAll(ranks, ['KKK', '55'])) { hand.rank = 259; } else
		if (this.stringContainsAll(ranks, ['KKK', '44'])) { hand.rank = 258; } else
		if (this.stringContainsAll(ranks, ['KKK', '33'])) { hand.rank = 257; } else
		if (this.stringContainsAll(ranks, ['KKK', '22'])) { hand.rank = 256; } else
		if (this.stringContainsAll(ranks, ['QQQ', 'AA'])) { hand.rank = 255; } else
		if (this.stringContainsAll(ranks, ['QQQ', 'KK'])) { hand.rank = 254; } else
		if (this.stringContainsAll(ranks, ['QQQ', 'JJ'])) { hand.rank = 253; } else
		if (this.stringContainsAll(ranks, ['QQQ', 'TT'])) { hand.rank = 252; } else
		if (this.stringContainsAll(ranks, ['QQQ', '99'])) { hand.rank = 251; } else
		if (this.stringContainsAll(ranks, ['QQQ', '88'])) { hand.rank = 250; } else
		if (this.stringContainsAll(ranks, ['QQQ', '77'])) { hand.rank = 249; } else
		if (this.stringContainsAll(ranks, ['QQQ', '66'])) { hand.rank = 248; } else
		if (this.stringContainsAll(ranks, ['QQQ', '55'])) { hand.rank = 247; } else
		if (this.stringContainsAll(ranks, ['QQQ', '44'])) { hand.rank = 246; } else
		if (this.stringContainsAll(ranks, ['QQQ', '33'])) { hand.rank = 245; } else
		if (this.stringContainsAll(ranks, ['QQQ', '22'])) { hand.rank = 244; } else
		if (this.stringContainsAll(ranks, ['JJJ', 'AA'])) { hand.rank = 243; } else
		if (this.stringContainsAll(ranks, ['JJJ', 'KK'])) { hand.rank = 242; } else
		if (this.stringContainsAll(ranks, ['JJJ', 'QQ'])) { hand.rank = 241; } else
		if (this.stringContainsAll(ranks, ['JJJ', 'TT'])) { hand.rank = 240; } else
		if (this.stringContainsAll(ranks, ['JJJ', '99'])) { hand.rank = 239; } else
		if (this.stringContainsAll(ranks, ['JJJ', '88'])) { hand.rank = 238; } else
		if (this.stringContainsAll(ranks, ['JJJ', '77'])) { hand.rank = 237; } else
		if (this.stringContainsAll(ranks, ['JJJ', '66'])) { hand.rank = 236; } else
		if (this.stringContainsAll(ranks, ['JJJ', '55'])) { hand.rank = 235; } else
		if (this.stringContainsAll(ranks, ['JJJ', '44'])) { hand.rank = 234; } else
		if (this.stringContainsAll(ranks, ['JJJ', '33'])) { hand.rank = 233; } else
		if (this.stringContainsAll(ranks, ['JJJ', '22'])) { hand.rank = 232; } else
		if (this.stringContainsAll(ranks, ['TTT', 'AA'])) { hand.rank = 231; } else
		if (this.stringContainsAll(ranks, ['TTT', 'KK'])) { hand.rank = 230; } else
		if (this.stringContainsAll(ranks, ['TTT', 'QQ'])) { hand.rank = 229; } else
		if (this.stringContainsAll(ranks, ['TTT', 'JJ'])) { hand.rank = 228; } else
		if (this.stringContainsAll(ranks, ['TTT', '99'])) { hand.rank = 227; } else
		if (this.stringContainsAll(ranks, ['TTT', '88'])) { hand.rank = 226; } else
		if (this.stringContainsAll(ranks, ['TTT', '77'])) { hand.rank = 225; } else
		if (this.stringContainsAll(ranks, ['TTT', '66'])) { hand.rank = 224; } else
		if (this.stringContainsAll(ranks, ['TTT', '55'])) { hand.rank = 223; } else
		if (this.stringContainsAll(ranks, ['TTT', '44'])) { hand.rank = 222; } else
		if (this.stringContainsAll(ranks, ['TTT', '33'])) { hand.rank = 221; } else
		if (this.stringContainsAll(ranks, ['TTT', '22'])) { hand.rank = 220; } else
		if (this.stringContainsAll(ranks, ['999', 'AA'])) { hand.rank = 219; } else
		if (this.stringContainsAll(ranks, ['999', 'KK'])) { hand.rank = 218; } else
		if (this.stringContainsAll(ranks, ['999', 'QQ'])) { hand.rank = 217; } else
		if (this.stringContainsAll(ranks, ['999', 'JJ'])) { hand.rank = 216; } else
		if (this.stringContainsAll(ranks, ['999', 'TT'])) { hand.rank = 215; } else
		if (this.stringContainsAll(ranks, ['999', '88'])) { hand.rank = 214; } else
		if (this.stringContainsAll(ranks, ['999', '77'])) { hand.rank = 213; } else
		if (this.stringContainsAll(ranks, ['999', '66'])) { hand.rank = 212; } else
		if (this.stringContainsAll(ranks, ['999', '55'])) { hand.rank = 211; } else
		if (this.stringContainsAll(ranks, ['999', '44'])) { hand.rank = 210; } else
		if (this.stringContainsAll(ranks, ['999', '33'])) { hand.rank = 209; } else
		if (this.stringContainsAll(ranks, ['999', '22'])) { hand.rank = 208; } else
		if (this.stringContainsAll(ranks, ['888', 'AA'])) { hand.rank = 207; } else
		if (this.stringContainsAll(ranks, ['888', 'KK'])) { hand.rank = 206; } else
		if (this.stringContainsAll(ranks, ['888', 'QQ'])) { hand.rank = 205; } else
		if (this.stringContainsAll(ranks, ['888', 'JJ'])) { hand.rank = 204; } else
		if (this.stringContainsAll(ranks, ['888', 'TT'])) { hand.rank = 203; } else
		if (this.stringContainsAll(ranks, ['888', '99'])) { hand.rank = 202; } else
		if (this.stringContainsAll(ranks, ['888', '77'])) { hand.rank = 201; } else
		if (this.stringContainsAll(ranks, ['888', '66'])) { hand.rank = 200; } else
		if (this.stringContainsAll(ranks, ['888', '55'])) { hand.rank = 199; } else
		if (this.stringContainsAll(ranks, ['888', '44'])) { hand.rank = 198; } else
		if (this.stringContainsAll(ranks, ['888', '33'])) { hand.rank = 197; } else
		if (this.stringContainsAll(ranks, ['888', '22'])) { hand.rank = 196; } else
		if (this.stringContainsAll(ranks, ['777', 'AA'])) { hand.rank = 195; } else
		if (this.stringContainsAll(ranks, ['777', 'KK'])) { hand.rank = 194; } else
		if (this.stringContainsAll(ranks, ['777', 'QQ'])) { hand.rank = 193; } else
		if (this.stringContainsAll(ranks, ['777', 'JJ'])) { hand.rank = 192; } else
		if (this.stringContainsAll(ranks, ['777', 'TT'])) { hand.rank = 191; } else
		if (this.stringContainsAll(ranks, ['777', '99'])) { hand.rank = 190; } else
		if (this.stringContainsAll(ranks, ['777', '88'])) { hand.rank = 189; } else
		if (this.stringContainsAll(ranks, ['777', '66'])) { hand.rank = 188; } else
		if (this.stringContainsAll(ranks, ['777', '55'])) { hand.rank = 187; } else
		if (this.stringContainsAll(ranks, ['777', '44'])) { hand.rank = 186; } else
		if (this.stringContainsAll(ranks, ['777', '33'])) { hand.rank = 185; } else
		if (this.stringContainsAll(ranks, ['777', '22'])) { hand.rank = 184; } else
		if (this.stringContainsAll(ranks, ['666', 'AA'])) { hand.rank = 183; } else
		if (this.stringContainsAll(ranks, ['666', 'KK'])) { hand.rank = 182; } else
		if (this.stringContainsAll(ranks, ['666', 'QQ'])) { hand.rank = 181; } else
		if (this.stringContainsAll(ranks, ['666', 'JJ'])) { hand.rank = 180; } else
		if (this.stringContainsAll(ranks, ['666', 'TT'])) { hand.rank = 179; } else
		if (this.stringContainsAll(ranks, ['666', '99'])) { hand.rank = 178; } else
		if (this.stringContainsAll(ranks, ['666', '88'])) { hand.rank = 177; } else
		if (this.stringContainsAll(ranks, ['666', '77'])) { hand.rank = 176; } else
		if (this.stringContainsAll(ranks, ['666', '55'])) { hand.rank = 175; } else
		if (this.stringContainsAll(ranks, ['666', '44'])) { hand.rank = 174; } else
		if (this.stringContainsAll(ranks, ['666', '33'])) { hand.rank = 173; } else
		if (this.stringContainsAll(ranks, ['666', '22'])) { hand.rank = 172; } else
		if (this.stringContainsAll(ranks, ['555', 'AA'])) { hand.rank = 171; } else
		if (this.stringContainsAll(ranks, ['555', 'KK'])) { hand.rank = 170; } else
		if (this.stringContainsAll(ranks, ['555', 'QQ'])) { hand.rank = 169; } else
		if (this.stringContainsAll(ranks, ['555', 'JJ'])) { hand.rank = 168; } else
		if (this.stringContainsAll(ranks, ['555', 'TT'])) { hand.rank = 167; } else
		if (this.stringContainsAll(ranks, ['555', '99'])) { hand.rank = 166; } else
		if (this.stringContainsAll(ranks, ['555', '88'])) { hand.rank = 165; } else
		if (this.stringContainsAll(ranks, ['555', '77'])) { hand.rank = 164; } else
		if (this.stringContainsAll(ranks, ['555', '66'])) { hand.rank = 163; } else
		if (this.stringContainsAll(ranks, ['555', '44'])) { hand.rank = 162; } else
		if (this.stringContainsAll(ranks, ['555', '33'])) { hand.rank = 161; } else
		if (this.stringContainsAll(ranks, ['555', '22'])) { hand.rank = 160; } else
		if (this.stringContainsAll(ranks, ['444', 'AA'])) { hand.rank = 159; } else
		if (this.stringContainsAll(ranks, ['444', 'KK'])) { hand.rank = 158; } else
		if (this.stringContainsAll(ranks, ['444', 'QQ'])) { hand.rank = 157; } else
		if (this.stringContainsAll(ranks, ['444', 'JJ'])) { hand.rank = 156; } else
		if (this.stringContainsAll(ranks, ['444', 'TT'])) { hand.rank = 155; } else
		if (this.stringContainsAll(ranks, ['444', '99'])) { hand.rank = 154; } else
		if (this.stringContainsAll(ranks, ['444', '88'])) { hand.rank = 153; } else
		if (this.stringContainsAll(ranks, ['444', '77'])) { hand.rank = 152; } else
		if (this.stringContainsAll(ranks, ['444', '66'])) { hand.rank = 151; } else
		if (this.stringContainsAll(ranks, ['444', '55'])) { hand.rank = 150; } else
		if (this.stringContainsAll(ranks, ['444', '33'])) { hand.rank = 149; } else
		if (this.stringContainsAll(ranks, ['444', '22'])) { hand.rank = 148; } else
		if (this.stringContainsAll(ranks, ['333', 'AA'])) { hand.rank = 147; } else
		if (this.stringContainsAll(ranks, ['333', 'KK'])) { hand.rank = 146; } else
		if (this.stringContainsAll(ranks, ['333', 'QQ'])) { hand.rank = 145; } else
		if (this.stringContainsAll(ranks, ['333', 'JJ'])) { hand.rank = 144; } else
		if (this.stringContainsAll(ranks, ['333', 'TT'])) { hand.rank = 143; } else
		if (this.stringContainsAll(ranks, ['333', '99'])) { hand.rank = 142; } else
		if (this.stringContainsAll(ranks, ['333', '88'])) { hand.rank = 141; } else
		if (this.stringContainsAll(ranks, ['333', '77'])) { hand.rank = 140; } else
		if (this.stringContainsAll(ranks, ['333', '66'])) { hand.rank = 139; } else
		if (this.stringContainsAll(ranks, ['333', '55'])) { hand.rank = 138; } else
		if (this.stringContainsAll(ranks, ['333', '44'])) { hand.rank = 137; } else
		if (this.stringContainsAll(ranks, ['333', '22'])) { hand.rank = 136; } else
		if (this.stringContainsAll(ranks, ['222', 'AA'])) { hand.rank = 135; } else
		if (this.stringContainsAll(ranks, ['222', 'KK'])) { hand.rank = 134; } else
		if (this.stringContainsAll(ranks, ['222', 'QQ'])) { hand.rank = 133; } else
		if (this.stringContainsAll(ranks, ['222', 'JJ'])) { hand.rank = 132; } else
		if (this.stringContainsAll(ranks, ['222', 'TT'])) { hand.rank = 131; } else
		if (this.stringContainsAll(ranks, ['222', '99'])) { hand.rank = 130; } else
		if (this.stringContainsAll(ranks, ['222', '88'])) { hand.rank = 129; } else
		if (this.stringContainsAll(ranks, ['222', '77'])) { hand.rank = 128; } else
		if (this.stringContainsAll(ranks, ['222', '66'])) { hand.rank = 127; } else
		if (this.stringContainsAll(ranks, ['222', '55'])) { hand.rank = 126; } else
		if (this.stringContainsAll(ranks, ['222', '44'])) { hand.rank = 125; } else
		if (this.stringContainsAll(ranks, ['222', '33'])) { hand.rank = 124; } else
		if (hand.rank !== 0) { hand.message = 'Full House'; }
		return hand;
	}

	static evalStraightFlush(hand: Hand, ranks: string): Hand {
		if (hand.rank !== 123) {
			return hand;
		}

		if (this.stringContainsAll(ranks, ['T', 'J', 'Q', 'K', 'A'])) { hand.rank = 302; } else
		if (this.stringContainsAll(ranks, ['9', 'T', 'J', 'Q', 'K'])) { hand.rank = 301; } else
		if (this.stringContainsAll(ranks, ['8', '9', 'T', 'J', 'Q'])) { hand.rank = 300; } else
		if (this.stringContainsAll(ranks, ['7', '8', '9', 'T', 'J'])) { hand.rank = 299; } else
		if (this.stringContainsAll(ranks, ['6', '7', '8', '9', 'T'])) { hand.rank = 298; } else
		if (this.stringContainsAll(ranks, ['5', '6', '7', '8', '9'])) { hand.rank = 297; } else
		if (this.stringContainsAll(ranks, ['4', '5', '6', '7', '8'])) { hand.rank = 296; } else
		if (this.stringContainsAll(ranks, ['3', '4', '5', '6', '7'])) { hand.rank = 295; } else
		if (this.stringContainsAll(ranks, ['2', '3', '4', '5', '6'])) { hand.rank = 294; } else
		if (this.stringContainsAll(ranks, ['A', '2', '3', '4', '5'])) { hand.rank = 293; }
		if (hand.rank !== 0) {hand.message = 'Straight Flush'; }

		return hand;
	}

	static evalFlush(hand: Hand, suits: string): Hand {
		if (suits.indexOf('CCCCC') > -1
			|| suits.indexOf('DDDDD') > -1
			|| suits.indexOf('HHHHH') > -1
			|| suits.indexOf('SSSSS') > -1) {
				hand.rank = 123; hand.message = 'Flush';
		}

		return hand;
	}

	static evalStraight(hand: Hand, ranks: string): Hand {
		if (this.stringContainsAll(ranks, ['T', 'J', 'Q', 'K', 'A'])) { hand.rank = 122; } else
		if (this.stringContainsAll(ranks, ['9', 'T', 'J', 'Q', 'K'])) { hand.rank = 121; } else
		if (this.stringContainsAll(ranks, ['8', '9', 'T', 'J', 'Q'])) { hand.rank = 120; } else
		if (this.stringContainsAll(ranks, ['7', '8', '9', 'T', 'J'])) { hand.rank = 119; } else
		if (this.stringContainsAll(ranks, ['6', '7', '8', '9', 'T'])) { hand.rank = 118; } else
		if (this.stringContainsAll(ranks, ['5', '6', '7', '8', '9'])) { hand.rank = 117; } else
		if (this.stringContainsAll(ranks, ['4', '5', '6', '7', '8'])) { hand.rank = 116; } else
		if (this.stringContainsAll(ranks, ['3', '4', '5', '6', '7'])) { hand.rank = 115; } else
		if (this.stringContainsAll(ranks, ['2', '3', '4', '5', '6'])) { hand.rank = 114; } else
		if (this.stringContainsAll(ranks, ['A', '2', '3', '4', '5'])) { hand.rank = 113; }
		if (hand.rank !== 0) {hand.message = 'Straight'; }

		return hand;
	}

	static evalThreeOfAKind(hand: Hand, ranks: string): Hand {
		if (ranks.indexOf('AAA') > -1) { hand.rank = 112 + this.evalKickers(ranks.replace('AAA', ''), 2); }
		if (ranks.indexOf('KKK') > -1) { hand.rank = 111 + this.evalKickers(ranks.replace('KKK', ''), 2); }
		if (ranks.indexOf('QQQ') > -1) { hand.rank = 110 + this.evalKickers(ranks.replace('QQQ', ''), 2); }
		if (ranks.indexOf('JJJ') > -1) { hand.rank = 109 + this.evalKickers(ranks.replace('JJJ', ''), 2); }
		if (ranks.indexOf('TTT') > -1) { hand.rank = 108 + this.evalKickers(ranks.replace('TTT', ''), 2); }
		if (ranks.indexOf('999') > -1) { hand.rank = 107 + this.evalKickers(ranks.replace('999', ''), 2); }
		if (ranks.indexOf('888') > -1) { hand.rank = 106 + this.evalKickers(ranks.replace('888', ''), 2); }
		if (ranks.indexOf('777') > -1) { hand.rank = 105 + this.evalKickers(ranks.replace('777', ''), 2); }
		if (ranks.indexOf('666') > -1) { hand.rank = 104 + this.evalKickers(ranks.replace('666', ''), 2); }
		if (ranks.indexOf('555') > -1) { hand.rank = 103 + this.evalKickers(ranks.replace('555', ''), 2); }
		if (ranks.indexOf('444') > -1) { hand.rank = 102 + this.evalKickers(ranks.replace('444', ''), 2); }
		if (ranks.indexOf('333') > -1) { hand.rank = 101 + this.evalKickers(ranks.replace('333', ''), 2); }
		if (ranks.indexOf('222') > -1) { hand.rank = 100 + this.evalKickers(ranks.replace('222', ''), 2); }
		if (hand.rank !== 0) {hand.message = 'Three of a Kind'; }

		return hand;
	}

	static evalTwoPair(hand: Hand, ranks: string): Hand {
		if (this.stringContainsAll(ranks, ['AA', 'KK'])) { hand.rank = 99 + this.evalKickers(ranks.replace('AA', '').replace('KK', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', 'QQ'])) { hand.rank = 98 + this.evalKickers(ranks.replace('AA', '').replace('QQ', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', 'JJ'])) { hand.rank = 97 + this.evalKickers(ranks.replace('AA', '').replace('JJ', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', 'TT'])) { hand.rank = 96 + this.evalKickers(ranks.replace('AA', '').replace('TT', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', '99'])) { hand.rank = 95 + this.evalKickers(ranks.replace('AA', '').replace('99', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', '88'])) { hand.rank = 94 + this.evalKickers(ranks.replace('AA', '').replace('88', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', '77'])) { hand.rank = 93 + this.evalKickers(ranks.replace('AA', '').replace('77', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', '66'])) { hand.rank = 92 + this.evalKickers(ranks.replace('AA', '').replace('66', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', '55'])) { hand.rank = 91 + this.evalKickers(ranks.replace('AA', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', '44'])) { hand.rank = 90 + this.evalKickers(ranks.replace('AA', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', '33'])) { hand.rank = 89 + this.evalKickers(ranks.replace('AA', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['AA', '22'])) { hand.rank = 88 + this.evalKickers(ranks.replace('AA', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', 'QQ'])) { hand.rank = 87 + this.evalKickers(ranks.replace('KK', '').replace('QQ', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', 'JJ'])) { hand.rank = 86 + this.evalKickers(ranks.replace('KK', '').replace('JJ', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', 'TT'])) { hand.rank = 85 + this.evalKickers(ranks.replace('KK', '').replace('TT', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', '99'])) { hand.rank = 84 + this.evalKickers(ranks.replace('KK', '').replace('99', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', '88'])) { hand.rank = 83 + this.evalKickers(ranks.replace('KK', '').replace('88', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', '77'])) { hand.rank = 82 + this.evalKickers(ranks.replace('KK', '').replace('77', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', '66'])) { hand.rank = 81 + this.evalKickers(ranks.replace('KK', '').replace('66', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', '55'])) { hand.rank = 80 + this.evalKickers(ranks.replace('KK', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', '44'])) { hand.rank = 79 + this.evalKickers(ranks.replace('KK', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', '33'])) { hand.rank = 78 + this.evalKickers(ranks.replace('KK', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['KK', '22'])) { hand.rank = 77 + this.evalKickers(ranks.replace('KK', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', 'JJ'])) { hand.rank = 76 + this.evalKickers(ranks.replace('QQ', '').replace('JJ', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', 'TT'])) { hand.rank = 75 + this.evalKickers(ranks.replace('QQ', '').replace('TT', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', '99'])) { hand.rank = 74 + this.evalKickers(ranks.replace('QQ', '').replace('99', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', '88'])) { hand.rank = 73 + this.evalKickers(ranks.replace('QQ', '').replace('88', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', '77'])) { hand.rank = 72 + this.evalKickers(ranks.replace('QQ', '').replace('77', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', '66'])) { hand.rank = 71 + this.evalKickers(ranks.replace('QQ', '').replace('66', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', '55'])) { hand.rank = 70 + this.evalKickers(ranks.replace('QQ', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', '44'])) { hand.rank = 69 + this.evalKickers(ranks.replace('QQ', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', '33'])) { hand.rank = 68 + this.evalKickers(ranks.replace('QQ', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['QQ', '22'])) { hand.rank = 67 + this.evalKickers(ranks.replace('QQ', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', 'TT'])) { hand.rank = 66 + this.evalKickers(ranks.replace('JJ', '').replace('TT', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', '99'])) { hand.rank = 65 + this.evalKickers(ranks.replace('JJ', '').replace('99', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', '88'])) { hand.rank = 64 + this.evalKickers(ranks.replace('JJ', '').replace('88', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', '77'])) { hand.rank = 63 + this.evalKickers(ranks.replace('JJ', '').replace('77', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', '66'])) { hand.rank = 62 + this.evalKickers(ranks.replace('JJ', '').replace('66', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', '55'])) { hand.rank = 61 + this.evalKickers(ranks.replace('JJ', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', '44'])) { hand.rank = 60 + this.evalKickers(ranks.replace('JJ', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', '33'])) { hand.rank = 59 + this.evalKickers(ranks.replace('JJ', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['JJ', '22'])) { hand.rank = 58 + this.evalKickers(ranks.replace('JJ', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['TT', '99'])) { hand.rank = 57 + this.evalKickers(ranks.replace('TT', '').replace('99', ''), 1); } else
		if (this.stringContainsAll(ranks, ['TT', '88'])) { hand.rank = 56 + this.evalKickers(ranks.replace('TT', '').replace('88', ''), 1); } else
		if (this.stringContainsAll(ranks, ['TT', '77'])) { hand.rank = 55 + this.evalKickers(ranks.replace('TT', '').replace('77', ''), 1); } else
		if (this.stringContainsAll(ranks, ['TT', '66'])) { hand.rank = 54 + this.evalKickers(ranks.replace('TT', '').replace('66', ''), 1); } else
		if (this.stringContainsAll(ranks, ['TT', '55'])) { hand.rank = 53 + this.evalKickers(ranks.replace('TT', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['TT', '44'])) { hand.rank = 52 + this.evalKickers(ranks.replace('TT', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['TT', '33'])) { hand.rank = 51 + this.evalKickers(ranks.replace('TT', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['TT', '22'])) { hand.rank = 50 + this.evalKickers(ranks.replace('TT', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['99', '88'])) { hand.rank = 49 + this.evalKickers(ranks.replace('99', '').replace('88', ''), 1); } else
		if (this.stringContainsAll(ranks, ['99', '77'])) { hand.rank = 48 + this.evalKickers(ranks.replace('99', '').replace('77', ''), 1); } else
		if (this.stringContainsAll(ranks, ['99', '66'])) { hand.rank = 47 + this.evalKickers(ranks.replace('99', '').replace('66', ''), 1); } else
		if (this.stringContainsAll(ranks, ['99', '55'])) { hand.rank = 46 + this.evalKickers(ranks.replace('99', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['99', '44'])) { hand.rank = 45 + this.evalKickers(ranks.replace('99', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['99', '33'])) { hand.rank = 44 + this.evalKickers(ranks.replace('99', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['99', '22'])) { hand.rank = 43 + this.evalKickers(ranks.replace('99', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['88', '77'])) { hand.rank = 42 + this.evalKickers(ranks.replace('88', '').replace('77', ''), 1); } else
		if (this.stringContainsAll(ranks, ['88', '66'])) { hand.rank = 41 + this.evalKickers(ranks.replace('88', '').replace('66', ''), 1); } else
		if (this.stringContainsAll(ranks, ['88', '55'])) { hand.rank = 40 + this.evalKickers(ranks.replace('88', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['88', '44'])) { hand.rank = 39 + this.evalKickers(ranks.replace('88', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['88', '33'])) { hand.rank = 38 + this.evalKickers(ranks.replace('88', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['88', '22'])) { hand.rank = 37 + this.evalKickers(ranks.replace('88', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['77', '66'])) { hand.rank = 36 + this.evalKickers(ranks.replace('77', '').replace('66', ''), 1); } else
		if (this.stringContainsAll(ranks, ['77', '55'])) { hand.rank = 35 + this.evalKickers(ranks.replace('77', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['77', '44'])) { hand.rank = 34 + this.evalKickers(ranks.replace('77', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['77', '33'])) { hand.rank = 33 + this.evalKickers(ranks.replace('77', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['77', '22'])) { hand.rank = 32 + this.evalKickers(ranks.replace('77', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['66', '55'])) { hand.rank = 31 + this.evalKickers(ranks.replace('66', '').replace('55', ''), 1); } else
		if (this.stringContainsAll(ranks, ['66', '44'])) { hand.rank = 30 + this.evalKickers(ranks.replace('66', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['66', '33'])) { hand.rank = 29 + this.evalKickers(ranks.replace('66', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['66', '22'])) { hand.rank = 28 + this.evalKickers(ranks.replace('66', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['55', '44'])) { hand.rank = 27 + this.evalKickers(ranks.replace('55', '').replace('44', ''), 1); } else
		if (this.stringContainsAll(ranks, ['55', '33'])) { hand.rank = 26 + this.evalKickers(ranks.replace('55', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['55', '22'])) { hand.rank = 25 + this.evalKickers(ranks.replace('55', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['44', '33'])) { hand.rank = 24 + this.evalKickers(ranks.replace('44', '').replace('33', ''), 1); } else
		if (this.stringContainsAll(ranks, ['44', '22'])) { hand.rank = 23 + this.evalKickers(ranks.replace('44', '').replace('22', ''), 1); } else
		if (this.stringContainsAll(ranks, ['33', '22'])) { hand.rank = 22 + this.evalKickers(ranks.replace('33', '').replace('22', ''), 1); }
		if (hand.rank !== 0) {hand.message = 'Two Pair'; }

		return hand;
	}

	static evalOnePair(hand: Hand, ranks: string): Hand {
		if (ranks.indexOf('AA') > -1) { hand.rank = 21 + this.evalKickers(ranks.replace('AA', ''), 3); } else
		if (ranks.indexOf('KK') > -1) { hand.rank = 20 + this.evalKickers(ranks.replace('KK', ''), 3); } else
		if (ranks.indexOf('QQ') > -1) { hand.rank = 19 + this.evalKickers(ranks.replace('QQ', ''), 3); } else
		if (ranks.indexOf('JJ') > -1) { hand.rank = 18 + this.evalKickers(ranks.replace('JJ', ''), 3); } else
		if (ranks.indexOf('TT') > -1) { hand.rank = 17 + this.evalKickers(ranks.replace('TT', ''), 3); } else
		if (ranks.indexOf('99') > -1) { hand.rank = 16 + this.evalKickers(ranks.replace('99', ''), 3); } else
		if (ranks.indexOf('88') > -1) { hand.rank = 15 + this.evalKickers(ranks.replace('88', ''), 3); } else
		if (ranks.indexOf('77') > -1) { hand.rank = 14 + this.evalKickers(ranks.replace('77', ''), 3); } else
		if (ranks.indexOf('66') > -1) { hand.rank = 13 + this.evalKickers(ranks.replace('66', ''), 3); } else
		if (ranks.indexOf('55') > -1) { hand.rank = 12 + this.evalKickers(ranks.replace('55', ''), 3); } else
		if (ranks.indexOf('44') > -1) { hand.rank = 11 + this.evalKickers(ranks.replace('44', ''), 3); } else
		if (ranks.indexOf('33') > -1) { hand.rank = 10 + this.evalKickers(ranks.replace('33', ''), 3); } else
		if (ranks.indexOf('22') > -1) { hand.rank = 9 + this.evalKickers(ranks.replace('22', ''), 3); }
		if (hand.rank !== 0) {hand.message = 'Pair'; }
		return hand;
	}

	static evalHighCard(hand: Hand, ranks: string): Hand {
		if (ranks.indexOf('A') > -1) { hand.rank = 8 + this.evalKickers(ranks.replace('A', ''), 4); } else
		if (ranks.indexOf('K') > -1) { hand.rank = 7 + this.evalKickers(ranks.replace('K', ''), 4); } else
		if (ranks.indexOf('Q') > -1) { hand.rank = 6 + this.evalKickers(ranks.replace('Q', ''), 4); } else
		if (ranks.indexOf('J') > -1) { hand.rank = 5 + this.evalKickers(ranks.replace('J', ''), 4); } else
		if (ranks.indexOf('T') > -1) { hand.rank = 4 + this.evalKickers(ranks.replace('T', ''), 4); } else
		if (ranks.indexOf('9') > -1) { hand.rank = 3 + this.evalKickers(ranks.replace('9', ''), 4); } else
		if (ranks.indexOf('8') > -1) { hand.rank = 2 + this.evalKickers(ranks.replace('8', ''), 4); } else
		if (ranks.indexOf('7') > -1) { hand.rank = 1 + this.evalKickers(ranks.replace('7', ''), 4); }
		if (hand.rank !== 0) {hand.message = 'High Card'; }

		return hand;
	}

	static evalKickers(ranks: string, noOfCards: number): number {
		let i: number;
		let kickerRank = 0.0000;
		let myRanks = new Array<number>();
		let rank: string;
		kickerRank = 0.0000;
		myRanks = [];

		for (i = 0; i <= ranks.length; i += 1) {
			rank = ranks.substr(i, 1);
			if (rank === 'A') {myRanks.push(0.2048); }
			if (rank === 'K') {myRanks.push(0.1024); }
			if (rank === 'Q') {myRanks.push(0.0512); }
			if (rank === 'J') {myRanks.push(0.0256); }
			if (rank === 'T') {myRanks.push(0.0128); }
			if (rank === '9') {myRanks.push(0.0064); }
			if (rank === '8') {myRanks.push(0.0032); }
			if (rank === '7') {myRanks.push(0.0016); }
			if (rank === '6') {myRanks.push(0.0008); }
			if (rank === '5') {myRanks.push(0.0004); }
			if (rank === '4') {myRanks.push(0.0002); }
			if (rank === '3') {myRanks.push(0.0001); }
			if (rank === '2') {myRanks.push(0.0000); }
		}
		myRanks.sort(this.sortNumeric);

		for (i = 0; i < noOfCards; i += 1) {
			kickerRank += myRanks[i];
		}

		return kickerRank;
	}

	constructor() {

	}
}

export class Hand {
	cards: string[];
	rank: number;
	message: string;
	constructor(info?: {cards: string[], rank?: number, message?: string}) {
		if (info) {
			this.cards = info.cards;
			this.rank = info.rank || 0.0000;
			this.message = info.message || '';
		}
	}
}
