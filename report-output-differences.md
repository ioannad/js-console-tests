# JS console output differences

This is a summary of the differences between the outputs produced by calls to the `console API` in different JS runtimes.

The JS runtimes compared so far are:

- [Node.js](https://nodejs.org/) v19.9.0
- [Deno](https://deno.com/) 1.34.1 via `deno run`
- [Cloudflare Workers Playground](https://developers.cloudflare.com/workers/learning/playground/) (CFW)

## Log producing setup

The log entries we compared were produced with some `.js` tests described in the next subsection.

The log entries from terminal based runtimes (Node.js, Deno) were collected using a bash script that runs and waits on each `.js` test, collecting the `stdout` and `stderr` streams while adding  messages to help track where each output was produced.

For cloud based (serverless or server-side) runtimes (CFW) we manually pasted the contents of each JS test in a different Playground's code, saved them locally and appended them manually in the order they are appended by the bash script. 

### The JS tests

The first test we used is called `output-check.js`, and it builts on the previous [quickcheck.js](./quickcheck.js), adding more complex arguments, and including the corner cases identified in the console spec's [NOTES.md](https://github.com/ioannad/console/blob/main/NOTES.md).

The rest of the tests are versions of the manual [wpt tests for console](https://github.com/web-platform-tests/wpt/tree/master/console). The manual tests there are in scripts in html pages, which pages show what the output should be. The rewritten tests are `.js`files, which print (using `console.log`) what the output should be and then run the contents of the original test's script.

### Collecting the log entries to compare

#### Terminal based

The bash program `survey-console-outputs.sh` contains a testing function that takes the following arguments.

- `JS_NAME` for the short name of the JS implementation to run, and

- `JS_COMMAND` for the command that runs the `.js` programs in that JS implementation. The testing function ran each `.js` program twice, once redirecting `stdout` and `stderr` to separate output files called `outputs/JS_NAME/stdout.log` `outputs/JS_NAME/stdout.log`, and once redirecting both `stdout`and `stderr` to the same output file called `outputs/JS_NAME/stream.log`.

The bash script runs the testing function for each terminal based JS runtime.

#### Server side

For CFW each test ran manually by pasting the test file contents to a new playground instance's code area, pressing `Update`, and then downloading the resulting log file by right click on the playground's console and selecting "Save as...". All these partial logs were appended to create the sole CFW log `outputs/cfw/std.log`, in the same order as the corresponding tests were ran by the bash script,

To make the comparison with the terminal based logs easier, we removed the prepended `worker.js:XXX` annotations from the CFW log  by opening it with Emacs and using `M-x replace-regexp RET worker\.js:[0-9]+[ ] RET`.

### Comparing the log  entries.

The log files with each output were compared visually using

```
$ meld outputs/deno/std.log outputs/node/std.log outputs/cfw/std.log
```

## Observed output differences

### Terminal based stdout and console.clear

In short, three points are descibed in this section:

- When the console contents are dumped in a terminal, 14 _previous_ lines from the terminal are removed as well.
- When the console contents are redirected to files using `>>`, neither Node.js nor Deno empty the console.
- In Node.js, a call to `console.clear` does not clear the group stack.

In particular, the output is quite different between:

1. when `stdout` and `stderr` are dumped to a terminal, to
2. when `stdout` and `stderr` are redirected to a file via `>>`.

In case 1, `console.clear()` clears not only the console and its logged messages and assertion errors, but additional lines from the terminal's previous output (!). Both Node.js and Deno clear 14 additional lines from the terminal's history previous to and including the command that ran the js test, that is the line `$ node output-check.js` and the previous 13 lines in the terminal.

In case 2, `console.clear()` does not clear the console.

In both cases, when ran with Node.js, a group that is created before the call to `console.clear`, seems to be still on the group stack until a few lines later an additional `console.groupEnd` is encountered. This can be seen by the indentation of the output.

For completeness note that the console output we got from CFG was set to `Preserve log` by default, which caused `console.clear` to produce the info level log message `console.clear() was prevented due to 'Preserve log'`.

**TODO?** Experiment with CFG console.clear with `Preserve log` deactivated.

### Traces and warnings

Different runtimes produce traces of different sizes. Node produces the longest, and CFG the shortest.

#### More traces in CFW

In CFW by default there are traces resulting from calls to the following methods, which do not produce a trace in Deno, nor in Node.js:

- `console.error`
- `console.warn`
- `console.assert(false, ...)` - specified as log grouping: error
- `console.time(undefined);` - after a `console.time()` - specified as log grouping: warn
- `console.timeEnd(undefined);` -  after a ``console.timeEnd()` - unspecified but indicated in spec this should be log grouping warning.
- `console.countReset` for an unknown label

It's worth noting that Node.js does suggest using the flag `--trace-warnings` to see a trace of `console.countReset` and `console.timeLog`, but no such suggestion for `console.timeEnd` of an unknown label.

#### Location of the traces

The CFG traces are always inline, unlike for Node.js and Deno. It's surprising to see that some warnings produced by Node.js are appended to `stderr` after the end of the test logging them.

In particul, the following calls in Node.js seem to append their warnings in the end of the test that called them.

- `console.countReset({toString() {return "default"}})`
- `console.countReset("b")` for unknown label "b"
- `console.timeLog("b")` for unknown label "b"
- `console.timeEnd("b")` for unknown label "b"

All the other warnings were printed inline along the stdout contents.

#### Inconsistent annotation of traces

It is unclear whether the Deno-friendly [version of the wpt test](./wpt4repl/console-number-format-specifiers-symbol--deno-REPL-output) for a number format specifier applied to a symbol fails or not. The test claims all logs should be `NaN` but Deno and Node.js log `Trace: NaN`, as they log  all traces . CFW on the other hand logs `NaN`, but still attaches a trace, which also is how every trace is logged here.

### Counting

Spec: https://console.spec.whatwg.org/#counting

#### Missing labels when counting [] or ""

A call to `console.count([])` as well as a call to `console.count("")` push log entries with empty labels, e.g., `: 1``. In CFW, even the colon after the label is missing, so such counts appear as plain integers.

#### Wrong counts and equivalent labels

In CFW, a call to `console.count([])` followed by`console.count("")` get both logged with counts `1`.

###### Labels []=""

Node.js and Deno however log count  `2` for the empty string, indicating that the empty array label `[]` and the empty string label `""` are treated as equivalent, possibly identifying the empty string as an empty array of characters.

###### Labels

In the output of the [version of the wpt test for countReset](./wpt4repl/console-countReset-logging-REPL-output.js) we get log entries with different counts than the test dictates. We annotated the test file (linked above) with these partially wrong counts.

The different counts for the labels, possibly mean that in all tested JS runtimes, `console.count` treats non-existing input the same as `undefined` and as the same as the string "default".
The count of 3 in Node.js seems to indicate that `countReset` doesn't work when the label is `{toString() {return "default"}`.

#### Unexpected warning and its location from countReset in Node.js

In the [version of wpt test for countReset](./wpt4repl/console-countReset-logging-REPL-output.js) both the expected and an extra unexpected warning appear after the end of the test's `stdout`. The unexpected warning log entry is:

```
(node:41944) Warning: Count for 'default' does not exist
(Use `node --trace-warnings ...` to show where the warning was created)
```

**TODO** Investigate further? It seems to come from `console.countReset({toString() {return "default"}})` not resetting that label.

### Timing and timers

Spec: https://console.spec.whatwg.org/#timing

#### Deno and CFW always logging time 0ms

All the timers created by `test_console_timing()` in [output-check.js](./output-test.js) test logs 0ms in Deno and in CFW, but not in Node.js, which logs times in the range of 0.178ms -- 0.423ms.

In [our version of the wpt timing test](./wpt4repl/console-timing-logging-REPL-output.js), again all Deno and CFW time logs are 0ms, but Node.js logs times in the range of 0.003ms -- 0.341ms.

#### Timer label empty=undefined=default in Deno and CFW, but in Node.js?

The findings here in short:

- In Deno and CFW, the empty timer label is the same as the `undefined` label, and they both log `default` as their label name.

- In Node.js, the `undefined` label could be mapping to a different timer than the empty label, even though they are both logged with the label name `default`.

-  However, a call to `timeEnd(undefined)` after a call to `timeEnd()` does not log any output whatsoever.

##### Details

- A call to `console.time(undefined)` after a call to `console.time()`:
  + Deno and CFW log a warning.
    * Deno logs the warning `Timer 'default' already exists`.
    * CFW logs the warning  `'default' already exists`, and attaches a trace inline.
  + Node.js could be creating a different timer with the label `undefined`, as there is no warning logged.
    * However,  a call to `console.timeEnd(undefined)` just below, doesn't log anything at all.
- A call to `console.timeLog(undefined)` after a call to `console.timeLog()`:
  + All three runtimes seem to print both these labels as `default`.
  + Deno and Node.js log 0ms everywhere.
- A call to `console.timeEnd(undefined)` after a call to `console.time()`:
  + Deno and CFW log a warning the `undefined` label second time as expected.
  + Node.js does not return a warning the second time, nor a time, or anything at all.

Both behaviours of `console.time` are compatible with [the spec](https://console.spec.whatwg.org/#time) which specifies such warnings as optional.

Neither the [spec of `timeLog`](https://console.spec.whatwg.org/#timelog), nor the [spec of `timeEnd`](https://console.spec.whatwg.org/#timeend) mention what should happen when the label queried in the timer table does not exist. However, there is a note indicating that producing a warning should be made the correct behaviour.

### Format specifiers

Spec: https://console.spec.whatwg.org/#formatter

#### Decimal format specifier applied to null

`console.log("%d", null)` logs `NaN` in Deno and in CFG, but `0` in Node.js.

#### String format specifier getting an object

`console.assert(false, "robert keeps %s on his balcony", {foo: "bar"})` returns

- `Assertion failed: robert keeps [object Object] on his balcony` in Deno and CFW, but
- `Assertion failed: robert keeps { foo: 'bar' } on his balcony` in Node.js.

**TODO** try the other console methods with this input.

#### string format specifier receiving a symbol

The REPL version of the [wpt test for string formatting of a symbol](https://github.com/web-platform-tests/wpt/blob/master/console/console-string-format-specifier-symbol-manual.html) has 5 calls and says the output should be 5 times `Symbol(description)`.

- Deno prints `%s` for the second call (`console.dirxml`).

- For the third call (`console.trace`) Deno and Node.js produce a `Trace: Symbol(description)` together with a trace to `stderr`. 

- CFW on the other hand produces all 5 times `Symbol(description)`, and in the case of a `console.trace` call, that log entry has a trace attached inline.

### Tables

Note that the exact behaviour of `console.table` is [unspecified](https://console.spec.whatwg.org/#table).

#### Table of a Set

```
console.table(new Set([{name: "terin", owner: false}, {name: "robert", owner: false}, {name: "domenic", owner: true}]));
```

The above produces different outputs in all three tested environments.

In Deno:

```
┌────────────┬───────────┬───────┐
│ (iter idx) │ name      │ owner │
├────────────┼───────────┼───────┤
│          0 │ "terin"   │ false │
│          1 │ "robert"  │ false │
│          2 │ "domenic" │ true  │
└────────────┴───────────┴───────┘
```

In Node.js:

```
┌───────────────────┬──────────────────────────────────┐
│ (iteration index) │              Values              │
├───────────────────┼──────────────────────────────────┤
│         0         │ { name: 'terin', owner: false }  │
│         1         │ { name: 'robert', owner: false } │
│         2         │ { name: 'domenic', owner: true } │
└───────────────────┴──────────────────────────────────┘
```

In CFW the log is unexpected:

```
(index)Value(index)Valuesize3Set(3)
```

#### Table errors in Deno and Node.js

In Deno and Node.js the following call logs an error.

```
console.table([[1, 2, 3, 4], [5, 6, 7, 8]], 2, 3);
```

In Deno the error's log message is surprising, as it mentions a string. It also contains some cryptic symbols and has a trace attached. 

```
[0m[1m[31merror[0m: Uncaught Error: The 'properties' argument must be of type Array. Received type string
  console.table([[1, 2, 3, 4], [5, 6, 7, 8]], 2, 3);
[0m[31m          ^[0m
```

In Node.js the error refers to a number, and it also has a trace.

```
node:internal/validators:290
    throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
    ^

TypeError [ERR_INVALID_ARG_TYPE]: The "properties" argument must be an instance of Array. Received type number (2)
```

CFW does not log an error, but again a surprising log entry:

```
(index)0123(index)01230123415678Array(2)
```

## 

### Superficial Differences

## #### console.clear strange output from Deno

When the console is not cleared after a call to `console.clear`, Deno prints some strange characters (`[1;1H[0J`) to `stdout`.

##### Indentation of second group

Deno seems to add three spaces indent to the second group in a group stack, while Node.js seems to add 1 space, and CFG none.

##### Confusing output from CFW for groupCollapsed

It seems that CFW prints a collapsed group literally as it would be shown in the console. That could be confusing to the unaware, as logs appear to be missing, and cannot be found anymore in the downloaded version of the CFW log file.

**TODO?** The membership of a log entry to a group around `groupEnd` should be probably looked at more carefully.

##### Output quotes of console.dir

`console.dir(["dir", 2])` produces the log entry:

- `[ "dir", 2 ]` in Deno,
- `[ 'dir', 2 ]` in Node.js, and
- a surprising Array(2) in CFW.

##### Output of console.dirxml

`console.dirxml([1,2], "default", null)` produces the log entry

- `[ 1, 2 ]` in Deno,
- `[ 1, 2 ] default null` in Node.js, and
- `(2) [1, 2] 'default' null` in CFW.

It seems that CFW distinguishes between the `default` symbol and the string "default" by using single quotes for the string case.

##### Typo in Deno's warning from timeLog

During the call to `console.timeLog("b")`, for unknown label `"b"`, Deno logs the typo `Timer 'b' does not exists`.



### Difference in unrelated JS code

#### ShadowRealms

ShadowRealm is not defined in neither of the tested implementations, so our [version of the wpt test for ShadowRealm](./wpt4repl/console-log-shadowrealm-REPL-output.js) fails in all tests.

#### Deno's syntax of a for-of loop

We saw an unexpected error when testing the formatter with integer specifiers receiving a symbol input, in particular only Deno's `stderr` contained an `Uncaught ReferenceError` when running the [version the number specifier with symbol test](./wpt4repl/console-number-format-specifiers-symbol-REPL-output.js).

```
Uncaught ReferenceError: method is not defined
for (method of methods) {
```

By further reducing of the test code and searching the documentation, it seems that Deno does not accept such for-loops where the loop variable (here `methods`) is not decorated with either `const` or `let`.

After modifying the [test to be run in Deno](./wpt4repl/console-number-format-specifiers-symbol--deno-REPL-output.js), we see a difference in the output from the call to `console["dirxml"]` which instead of three `NaN`, produces the following.

```
%i
%d
%f
```
