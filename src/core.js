import util from "util";

export class Program {
    constructor(statements) {
        this.statements = statements;
    }
}

export class PrintStatement {
    constructor(argument) {
        this.argument = argument;
    }
}

export class VariableDeclaration {
    constructor(variable, initializer) {
        //Object.assign(this, {variable, initializer}) //- another way to assign like below

        this.variable = variable;
        this.initializer = initializer;
    }
}

export class AssignmentStatement {
    constructor(target, source) {
        this.target = target;
        this.source = source;
    }
}

export class IfStatement {
    constructor(test, consequent, alternate) {
        Object.assign(this, { test, consequent, alternate });
    }
}

export class BinaryExpression {
    constructor(op, left, right) {
        Object.assign(this, { op, left, right });
    }
}

export class Variable {
	constructor(name) {
		this.name = name
	}
}

export class StringLiteral {
    constructor(contents) {
        this.contents = contents;
    }
}

// Got from bella core.js
// Return a compact and pretty string representation of the node graph,
// taking care of cycles. Written here from scratch because the built-in
// inspect function, while nice, isn't nice enough. Defined properly in
// the root class prototype so that it automatically runs on console.log.
Program.prototype[util.inspect.custom] = function () {
    const tags = new Map();

    // Attach a unique integer tag to every node
    function tag(node) {
        if (tags.has(node) || typeof node !== "object" || node === null) return;
        tags.set(node, tags.size + 1);
        for (const child of Object.values(node)) {
            Array.isArray(child) ? child.forEach(tag) : tag(child);
        }
    }

    function* lines() {
        function view(e) {
            if (tags.has(e)) return `#${tags.get(e)}`;
            if (Array.isArray(e)) return `[${e.map(view)}]`;
            return util.inspect(e);
        }
        for (let [node, id] of [...tags.entries()].sort(
            (a, b) => a[1] - b[1]
        )) {
            let type = node.constructor.name;
            let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`);
            yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`;
        }
    }

    tag(this);
    return [...lines()].join("\n");
};
