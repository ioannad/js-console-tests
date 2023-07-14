// This is the script file used to check for not-implemented errors. 
// All top-level exposed functions of the official console API are included.
// https://console.spec.whatwg.org/#console-namespace
//
//
// This script has been run as follows in the following environments without errors:
//
// - Firefox 113 and Chromium 113: in a new tab press Ctrl+Shift+i to evoke "(Web) Developer Tools", 
//   choose the 'Console' tab and copy-paste this entire script.
// - Node.js v19.9.0: node quickcheck.js
// - Deno 1.34.1: deno repl --eval-file=quickcheck.js
// - the Deno Deploy playground: TBA (can't remember/find out how I launched a playground, it was quite tricky, 
//   involving logging in and giving access to my entire github account which I disabled afterwards).
// - the Cloudflare Workers playground: Go to https://developers.cloudflare.com/workers/learning/playground/ click on 
//   "launch playground" and copy paste this entire script.
//
// Interestingly, in the JS REPL of a SpiderMonkey build (for Firefox 114), only `console.log` is defined.


function test_console_methods() {

  // Logging
  console.assert(true);
  console.assert(console.assert(true) == undefined);

  console.log("does this appear?"); //no
  console.group("foo");
  console.log("should not appear");
  console.clear();

  console.debug("debug");
  console.error("error");
  console.info("info");
  console.log("log");

  // from whatwg/console/NOTES.md
  console.table(new Set([{name: "terin", owner: false}, {name: "robert", owner: false}, {name: "domenic", owner: true}]));

  // from https://developer.mozilla.org/en-US/docs/Web/API/console/trace
  function tracedfoo() {
    function tracedbar() {
      console.trace();
    }
    tracedbar();
  }

  tracedfoo();

  console.warn("warn");

  console.dir(["dir", 2]);

  // ~data~ is any object or DOM element - Nodejs treats ~dirxml~ as ~log~.
  console.dirxml([1,2], "default", null);

  // Counting
  console.count();
  console.countReset("default");
  console.count("default");

  // Grouping
  console.group("foo");
  console.groupCollapsed("bar");
  console.groupEnd();
  console.groupEnd();

  // Timing
  console.time();
  console.time(null);

  console.timeLog();
  console.timeLog(null);

  console.timeEnd();
  console.timeEnd(null);
}


test_console_methods();
