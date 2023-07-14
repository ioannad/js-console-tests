// This is a modification of wpt test originally written by Dominic Farolino (domfarolino@gmail.com):
// https://github.com/web-platform-tests/wpt/blob/master/console/console-timing-logging-manual.html
//
// Spec: https://console.spec.whatwg.org/#timing

console.log("** Checking console timing methods");

console.log('   It should contain entries whose contents are:');
console.log('   default: <some time>');
console.log('   default: <some time>');

console.log('   default: <some time>');
console.log('   default: <some time> extra data');
console.log('   default: <some time>');

console.log('   default: <some time>');
console.log('   default: <some time> extra data');
console.log('   default: <some time>');

console.log('   default: <some time>');
console.log('   default: <some time> extra data');
console.log('   default: <some time>');

console.log('   custom toString(): <some time>');
console.log('   custom toString(): <some time> extra data');
console.log('   custom toString(): <some time>');

console.log('   a label: <some time>');
console.log('   a label: <some time> extra data');
console.log('   a label: <some time>');
console.log('   [some warning message indicating that a timer for label "b" does not exist]');

console.log('   --- Test start --- ');

console.time();
console.timeLog();
console.timeEnd();

console.time(undefined);
console.timeLog(undefined);
console.timeLog(undefined, "extra data");
console.timeEnd(undefined);

console.time("default");
console.timeLog("default");
console.timeLog("default", "extra data");
console.timeEnd("default");

console.time({toString() {return "default"}});
console.timeLog({toString() {return "default"}});
console.timeLog({toString() {return "default"}}, "extra data");
console.timeEnd({toString() {return "default"}});

console.time({toString() {return "custom toString()"}});
console.timeLog({toString() {return "custom toString()"}});
console.timeLog({toString() {return "custom toString()"}}, "extra data");
console.timeEnd({toString() {return "custom toString()"}});

console.time("a label");
console.timeLog("a label");
console.timeLog("a label", "extra data");
console.timeEnd("a label");

console.timeLog("b"); // should produce a warning
console.timeEnd("b"); // should produce a warning
console.log('   --- Test end --- ');
