#!/bin/bash

# set -x // uncomment for debugging

# This runs versions of the manual wpt tests, modified to be ran in JS environments (REPLs).
# The original tests are in the web-platform-test repository [1], and they are in html pages
# named ./wpt/console/console-*-manual.html
#
# [1] https://github.com/web-platform-tests/wpt/tree/master/console

runtests () {
    JS_NAME=$1
    JS_COMMAND=$2

    STDOUT=outputs/${JS_NAME}/stdout.log
    STDERR=outputs/${JS_NAME}/stderr.log
    STD=outputs/${JS_NAME}/std.log

    # Create outputs directories if necessary.
    mkdir -p outputs/${JS_NAME}

    # Warn if the output files exist.
    if [ -e ${STDOUT} ] || [ -e ${STDERR} ] || [ -e ${STD} ]
    then
        nanosecond_timestamp=$(date +%N)
        echo "${JS_NAME} output files already exist, moving them to files marked with \"-${nanosecond_timestamp}\"".
        mv ${STDOUT} ${STDOUT}-${nanosecond_timestamp}
        mv ${STDERR} ${STDERR}-${nanosecond_timestamp}
        mv ${STD} ${STD}-${nanosecond_timestamp}
    fi

    # Run js tests

    TESTS=(output-check.js   wpt4repl/console-count-logging-REPL-output.js   wpt4repl/console-countReset-logging-REPL-output.js   wpt4repl/console-log-shadowrealm-REPL-output.js   wpt4repl/console-timing-logging-REPL-output.js   wpt4repl/console-number-format-specifiers-symbol-REPL-output.js   wpt4repl/console-number-format-specifiers-symbol--deno-REPL-output.js   wpt4repl/console-string-format-specifier-symbol-REPL-output.js)

    {
        for TESTFILE in "${TESTS[@]}"; do
            echo " $ Running ${TESTFILE}"
            wait
            ${JS_COMMAND} ${TESTFILE}
            wait
        done
    } >> $STDOUT  2>> $STDERR

    wait
    {
        for TESTFILE in "${TESTS[@]}"; do
            echo " $ Running ${TESTFILE}"
            wait
            ${JS_COMMAND} ${TESTFILE}
            wait
        done
        echo " $ ----------- Finished running test files."
    } &>> $STD

    wait
    echo " $ --------- Output tests completed." >> $STDOUT
    echo " $ --------- Output tests completed." >> $STDERR
    echo " $ --------- Output tests completed." >> $STD

}

runtests "node" "node"
wait
runtests "deno" "deno run"
wait
