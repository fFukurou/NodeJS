// console.log(arguments);
// console.log(require('module').wrapper);

// module.exports
const C = require('./test-module-1');
const calc1 = new C();

console.log(calc1.add(6, 5));

// exports
// const calc2 = require('./test-module-2');
// console.log(calc2.add2(100,230));
const { add2, multiply2, divide2 } = require('./test-module-2');

console.log(multiply2(20, 7));

// caching

require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();