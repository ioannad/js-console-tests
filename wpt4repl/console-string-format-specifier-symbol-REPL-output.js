// This is a modification of wpt test originally written by Dominic Farolino (domfarolino@gmail.com):
// https://github.com/web-platform-tests/wpt/blob/master/console/console-string-format-specifier-on-symbol-manual.html
//
// Spec: https://console.spec.whatwg.org/#formatter

console.log('** Checking console string format specifier with Symbol');

console.log('   It should contain five entries, each of which are:');
console.log('   Symbol(description)');
console.log('   --- Test start --- ');
console.log("%s", Symbol.for("description"));
console.dirxml("%s", Symbol.for("description"));
console.trace("%s", Symbol.for("description"));
console.group("%s", Symbol.for("description"));
console.groupEnd();
console.groupCollapsed("%s", Symbol.for("description"));
console.groupEnd();
console.log('   --- Test end --- ');
