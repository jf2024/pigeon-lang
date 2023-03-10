import assert from "assert/strict";
import fs from "fs";
import ohm from "ohm-js";

const syntaxChecks = [
    ["all numeric literal forms", "sqwak(8 + 89.123)ð¦"],
    ["complex expressions", "sqwak(83 + ((((84-((((13 + 21)))))))) + 1 - 0)ð¦"],
    ["all binary operators", "sqwak (x + 2 - 3)ð¦"],
    ["end of program inside comment", "sqwak(0)ð¦ // yay"],
    ["comments with no text are ok", "sqwak(1)ð¦//\nsqwak(0)ð¦//"],
    ["non-Latin letters in identifiers", "ã³ã³ãã¤ã© = 100ð¦"],
];

const syntaxErrors = [
    ["non-letter in an identifier", "abð­c = 2", /Line 1, col 3/],
    ["malformed number", "x= 2.", /Line 1, col 6/],
    ["missing bird", "x = 3 y = 1", /Line 1, col 7/],
    ["a missing right operand", "sqwak(5 -", /Line 1, col 10/],
];

describe("The grammar", () => {
    const grammar = ohm.grammar(fs.readFileSync("src/pigeon.ohm"));
    for (const [scenario, source] of syntaxChecks) {
        it(`properly specifies ${scenario}`, () => {
            assert(grammar.match(source).succeeded());
        });
    }
    for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
        it(`does not permit ${scenario}`, () => {
            const match = grammar.match(source);
            assert(!match.succeeded());
            assert(new RegExp(errorMessagePattern).test(match.message));
        });
    }
});
