import fs from "fs";
import ohm from "ohm-js";
import * as core from "./core.js";

// Throw an error message that takes advantage of Ohm's messaging
function error(message, node) {
    if (node) {
        throw new Error(`${node.source.getLineAndColumnMessage()}${message}`);
    }
    throw new Error(message);
}

const pigeonGrammar = ohm.grammar(fs.readFileSync("src/pigeon.ohm"));

export default function analyze(sourceCode) {
    const analyzer = pigeonGrammar.createSemantics().addOperation("rep", {
        //rep = representation
        Program(body) {
            return new core.Program(body.rep());
        },

        PrintStmt(_sqwak, _left, argument, _right, _bird) {
            return core.PrintStatement(argument.rep());
        },
    });

    const match = pigeonGrammar.match(sourceCode);
    if (!match.succeeded()) error(match.message);
    //console.log("You're good!");
}
