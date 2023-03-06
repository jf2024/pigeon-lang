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
	const context = {
		locals: new Map(),
	}

    const analyzer = pigeonGrammar.createSemantics().addOperation("rep", {
        //rep = representation
        Program(body) {
            return new core.Program(body.rep()); 
        },

        PrintStmt(_sqwak, _left, argument, _right, _bird) {
            return new core.PrintStatement(argument.rep());
        },

        // _ means not using
        VarDec(_coo, identifier, _eq, initializer, _bird) {
			const name = identifier.rep();

            if (context.locals.has(name)) {
                error(`Redeclared variable: ${name}`, identifier);
            } 

			const variable = new core.Variable(name)
			context.locals.set(name, variable)

            return new core.VariableDeclaration(
                variable,
                initializer.rep()
            );
        },

        AssignStmt(target, _eq, source, _bird) {
			const name = target.rep() //the variable 
			const variable = context.locals.get(name) //variable we looking up in map

			if(!variable){
				error(`Undeclared variable: ${name}`, target)
			}

            return new core.AssignmentStatement(variable, source.rep());
        },

        IfStmt(_maybe, test, _yep, consequent, _nope, alternate, _fine) {
            return new core.IfStatement(
                test.rep(),
                consequent.rep(),
                alternate.rep()
            );
        },

        id(chars) {
            return chars.sourceString;
        },

        Var(id) {
            return id.rep();
        },

        Exp_add(left, _plus, right) {
            return new core.BinaryExpression("+", left.rep(), right.rep());
        },

        Exp_sub(left, _sub, right) {
            return new core.BinaryExpression("-", left.rep(), right.rep());
        },

        Term_parens(_open, expression, _close) {
            return expression.rep();
        },

        numeral(_leading, _dot, _fractional) {
            return Number(this.sourceString);
        },

        strlit(_open, chars, _close) {
            return new core.StringLiteral(chars.sourceString);
        },

        _iter(...children) {
            return children.map((child) => child.rep());
        },
    });

    const match = pigeonGrammar.match(sourceCode); //the CST
    if (!match.succeeded()) error(match.message);
    return analyzer(match).rep();
}
