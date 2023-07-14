// This is a modification of wpt test originally written by Dominic Farolino (domfarolino@gmail.com):
// https://github.com/web-platform-tests/wpt/blob/master/console/console-count-logging-manual.html
//
// Spec: https://console.spec.whatwg.org/#count

console.log("** Checking console.count");

console.log('   It should contain four entries whose contents are:');
console.log('   default: 1');
console.log('   default: 2');
console.log('   default: 3');
console.log('   default: 4');
console.log('   --- Test start --- ');
console.count();
console.count(undefined);
console.count("default");
console.count({toString() {return "default"}});
console.log('   --- Test end --- ');
