// This is a modification of wpt test originally written by Dominic Farolino (domfarolino@gmail.com):
// https://github.com/web-platform-tests/wpt/blob/master/console/console-number-format-specifiers-symbol-manual.html
//
// Spec: https://console.spec.whatwg.org/#formatter

console.log("** Checking formatter and format specifiers");

console.log('   It should contain 15 entries, each of which are:');
console.log('   NaN');

const methods = ["log", "dirxml", "trace", "group", "groupCollapsed"];

console.log('   --- Test start --- ');
for (method of methods) {
  console.log("   --- Testing %s", method); // To distinguish which method produces which output.
  console[method]("%i", Symbol.for("description"));
  if (method == "group" || method == "groupCollapsed") console.groupEnd();
  console[method]("%d", Symbol.for("description"));
  if (method == "group" || method == "groupCollapsed") console.groupEnd();
  console[method]("%f", Symbol.for("description"));
  if (method == "group" || method == "groupCollapsed") console.groupEnd();
}
console.log('   --- Test end --- ');
