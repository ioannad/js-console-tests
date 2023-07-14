# JS console runtime tests

This is a simple test suite to help survey differences in implementations of the `console` JavaScript (JS) object in different JS runtimes, also with the [official console spec](https://console.spec.whatwg.org/) in mind.

There is a [report with the curent findings](./report-output-differences.md).


## WIP

This repository is Work In Progress (WIP).

Work so far:

- JS tests whose outputs from different JS runtimes can be side by side compared for differences, and deviations from the spec when appropriate.
  - The current JS tests check the output of all exported methods of the [official console API](https://console.spec.whatwg.org/).
- Brief look into the streams that the console writes the logs to.
  + For terminal based JS runtimes there is a shell script that runs the test in a specific order, and repeats the tests twice, once redirecting `stderr` and `stdout` to different files, and once merging them in a common file.
- The JS runtimes tested so far: Deno, Node.js, Cloudflare Workers Playground.

Work to be done:

- Investigation of the logging streams of each environment, especially for the server-side/cloud based runtimes such as CloudFlare Workers and Amazon Lambda.
- For the output survey, there are still tests needed for non-standard console methods and specifiers used by various JS runtimes and browsers.
- Comparisons should also include more JS runtimes.

## Contents

There are JS tests, a shell script to run the JS tests, outputs from the tested JS runtimes, and a report comparing the differences in the outputs.

### JS Tests

- `quickcheck.js` - Test for "not implemented" errors, superficial usage of console methods, no output check. Observations from this are included in its own comments.
- `output-check.js`- Collection of tests for expected output of various calls to the console API. This also includes all the tests from [NOTES.md](https://github.com/whatwg/console/blob/main/NOTES.md) in the official console spec's source code. That file notes console API calls that are known to or have a history of producing different output among browsers.
- `wpt4repl/*.js` - Versions of the manual tests among the [web-platform-tests for console](https://github.com/web-platform-tests/wpt/tree/master/console) to be run in a JS REPL or environment. The original tests are js scripts in html files, and are lincenced under a _BSD 3-clause License_. The [original license](./wpt4repl/original-wpt-LICENSE.md) is in the same directory as the modified tests, `wpt4repl/`.

### Test Runner

The shell script `survey-console-outputs.sh` runs the above tests in a fixed order, so that the test outputs can easily be compared using tools such as `meld` or .

To run the tests manually in a console environment, such as Dev Tools, each `.js` test should be ran in a different console instance (e.g. Dev Tools from a new tab). For Cloudflare Workers we opened a different playground for each test. To produce comparable results save the outputs in a file, in the order the tests are done by the shell script. The test order is:

```
output-check.js
wpt4repl/console-count-logging-REPL-output.js
wpt4repl/console-countReset-logging-REPL-output.js
wpt4repl/console-log-shadowrealm-REPL-output.js
wpt4repl/console-timing-logging-REPL-output.js
wpt4repl/console-number-format-specifiers-symbol-REPL-output.js
wpt4repl/console-number-format-specifiers-symbol--deno-REPL-output.js
wpt4repl/console-string-format-specifier-symbol-REPL-output.js
```

### Test Outputs

This directory and its contents are generated when using the test runner above, which creates:

- The directory `outputs/`.
  + which contains directories `deno/` and `node/`, each containing the following files (named the same).
    + `stdout.log` -  the output of all the tests to the terminal's `stdout`.
    + `stderr.log` -  the output of all the tests to the terminal's `stderr`, that is console output with log level `warning` or `error`.
    + `std.log` -  the output of all the tests to the terminal's `stdout` and `stderr` as the tests happen.
  + Contains the directory `cfw/` which in turn contains:
    + A subdirectory `downloads/`, where we saved the console outputs from the tests.
    + `std.log` - A file where all the outputs in `downloads/` are concatenated in the order specified in the previous section. For this to be comparable with the other `std.log` files, we had to edit it by opening the file with Emacs and using `M-x replace-regexp RET worker\.js:[0-9]+[ ] RET`. The original file is also saved for reference.

Because the files that we want to compare have the same names, we could use `meld` to easily inspect the differences as follows.

```
 $ cd outputs
 $ meld deno/ node/ cfw/
```


### Report

The file `report-output-differences.md`  is a report describing the findings so far.
