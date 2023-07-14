// This is a modification of wpt test originally written by Dominic Farolino (domfarolino@gmail.com):
// https://github.com/web-platform-tests/wpt/blob/master/console/console-log-shadowrealm--manual.html
//

console.log('** Checking log in a new ShadowRealm');

console.log('   It should contain one entry saying "test passed".');

console.log('   --- Test start --- ');
const sr = new ShadowRealm();
sr.evaluate(`
  console.log("test passed");
`);
console.log('   --- Test end --- ');
