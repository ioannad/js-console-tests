// This is a modification of wpt test originally written by Dominic Farolino (domfarolino@gmail.com):
// https://github.com/web-platform-tests/wpt/blob/master/console/console-countReset-logging-manual.html
//
// Spec: https://console.spec.whatwg.org/#countreset

console.log("** Checking console.countReset");

console.log('   It should contain entries whose contents are:');
console.log('   default: 1');
console.log('   default: 1');

console.log('   default: 1');
console.log('   default: 1');

console.log('   default: 1');
console.log('   default: 1');

console.log('   default: 1');
console.log('   default: 1');

console.log('   a label: 1');
console.log('   a label: 1');
console.log('   [some warning message indicating that a count for label "b" does not exist]');

console.log('   --- Test start --- ');

console.count(); // default: 1
console.countReset();
console.count(); // default: 1

console.count(undefined); // default: 2
console.countReset(undefined);
console.count(undefined); // default: 1

console.count("default"); // default: 2
console.countReset("default");
console.count("default"); // default: 1

console.count({toString() {return "default"}}); // default: 2
console.countReset({toString() {return "default"}});
console.count({toString() {return "default"}}); // default: 3 only in Node.js

console.count("a label");
console.countReset();
console.count("a label");

console.countReset("b"); // should produce a warning
console.log('   --- Test end --- ');
