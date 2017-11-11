const EventEmitter = require('events');

let myArr = [];
const myFunFunc = function(a, b) {
	for (let i = 0; i <= a; i++) {
		myArr[i] = myArr[i] || 0;
		if (i === a) {
			myArr[a] = myArr[a] + b;
		}
	}
	console.log(myArr);
};

class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
	console.log('this happens synchronously', a, b);
	myFunFunc(a, b);
	setImmediate(() => {
		myEmitter.emit('event', a+1, b+1);
	});
});
myEmitter.emit('event', 0, 0);