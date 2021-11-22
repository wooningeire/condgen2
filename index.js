const userInput = {
	variableNames: [],
};

class ExprType {
	arity;
	stringFrom;

	constructor(arity, stringFrom) {
		this.arity = arity;
		this.stringFrom = stringFrom;
	}
}

class ExprRule {
	reducand;
	reduction;

	constructor({reducand, reduction}={}) {
		this.reducand = reducand;
		this.reduction = reduction;
	}
}

class Expr {
	static types = {
		CONST: new ExprType(1, ([state]) => state.toString()),

		// todo
		VAR: new ExprType(1, ([varId]) => userInput.variableNames[varId]),

		NOT: new ExprType(1, ([operand]) => {
			const usingParens = operand.type.arity !== 1;
			return `!${operand.toString(usingParens)}`;
		}),

		AND: new ExprType(Infinity, operands => this.stringFromMultinary(operands, " && ")),

		OR: new ExprType(Infinity, operands => this.stringFromMultinary(operands, " || ")),

		ANY: new ExprType(1, ([varId]) => {
			return `ANY[${varId}]`;
			// throw new TypeError("attempted to convert Expr of type ANY to string");
		}),
	};

	static rules = new Map();

	static stringFromMultinary(operands, separator) {
		let string = "";
			
		for (let i = 0; i < operands.length; i++) {
			const operand = operands[i];

			const usingParens = operand.type.arity !== 1;
			string += operand.toString(usingParens);
			
			if (i < operands.length - 1) {
				string += separator;
			}
		}

		return string;
	}

	type;
	operands;

	constructor(type, operands=[]) {
		this.type = type;
		this.operands = operands;
	}

	simplifyShallow() {
		let allRulesChecked = false;

		while (!allRulesChecked) {
			allRulesChecked = true;

			const rules = this.constructor.rules.get(this.type) || [];

			// console.log("rules", rules);
	
			for (const rule of rules) {
				// console.log(`checking rule ${rule.reducand} === ${rule.reduction}`);

				const variableElements = this.conformationUnder(rule);
				console.log(`rule ${rule.reducand} === ${rule.reduction} ${variableElements ? "applicable" : "not applicable"}`);
				if (!variableElements) continue;
	
				console.log(`reducing ${this}…`);
				this.reduce(rule, variableElements);
				console.log(`…into ${this}`, this);
				allRulesChecked = false;
				break;
			}
		}

		return this;
	}

	conformationUnder(rule) {
		const variableElements = [];

		const exprComparisons = [[this, rule.reducand]];
		for (const [exprTarget, exprRule] of exprComparisons) {
			// console.log("comparing", exprTarget, `(${exprTarget}) and`, exprRule, `(${exprRule})`);

			const matches = compare(exprTarget, exprRule);

			if (!matches) {
				return false;
			}
		}

		return variableElements;

		function compare(exprTarget, exprRule) {
			// TODO commutativity, multiple arity

			if (!(exprTarget instanceof Expr) || !(exprRule instanceof Expr)) {
				return exprTarget === exprRule;

			// If this expression type is the desired expression type
			} else if (exprTarget.type === exprRule.type) {

				// Add the operands to the queue as well
				for (let i = 0; i < exprTarget.operands.length; i++) {
					exprComparisons.push([exprTarget.operands[i], exprRule.operands[i]]);
				}

				return true;

			// If the desired expression type is ANY
			} else if (exprRule.type === Expr.types.ANY) {
				// Store the expression in the given slot, if a slot index is specified

				const variableElementId = exprRule.operands[0] ?? -1;
				
				// Skip if this ANY does not target an expression
				if (variableElementId < 0) return true;

				const element = variableElements[variableElementId];

				if (!element) {
					// Store this expression if the slot is empty
					variableElements[variableElementId] = exprTarget;

				} else if (element !== exprTarget) {
					// It does not match the format if the expression is not equal to the one already stored
					return false;
				}
				
			// The expression does not match the format
			} else {
				return false;
			}

			return true;
		}
	}

	reduce(rule, variableElements) {
		const clone = rule.reduction.cloneDeep(variableElements);
		Object.assign(this, clone);

		return this;
	}

	cloneDeep(variableElements=undefined) {
		if (variableElements && this.type === Expr.types.ANY) {
			const element = variableElements[this.operands[0]];
			return element.cloneDeep();
		} else {
			const expr = new Expr(this.type, []);

			for (const operand of this.operands) {
				if (operand instanceof Expr) {
					expr.operands.push(operand.cloneDeep(variableElements));
				} else {
					expr.operands.push(operand);
				}
			}

			return expr;
		}
	}

	toString(usingParens=false) {
		let string = this.type.stringFrom(this.operands);

		if (usingParens) {
			string = `(${string})`;
		}

		return string;
	}

	equiv(expr) {
		return this.hash() === expr.hash();
	}

	hash() {
		
	}
}

Expr.rules.set(Expr.types.NOT, [
	new ExprRule({
		reducand: new Expr(Expr.types.NOT, [
			new Expr(Expr.types.NOT, [
				new Expr(Expr.types.ANY, [0]),
			]),
		]),

		reduction: new Expr(Expr.types.ANY, [0]),
	}),

	new ExprRule({
		reducand: new Expr(Expr.types.NOT, [
			new Expr(Expr.types.CONST, [false]),
		]),

		reduction: new Expr(Expr.types.CONST, [true]),
	}),

	new ExprRule({
		reducand: new Expr(Expr.types.NOT, [
			new Expr(Expr.types.CONST, [true]),
		]),

		reduction: new Expr(Expr.types.CONST, [false]),
	}),
]);

Expr.rules.set(Expr.types.AND, [
	new ExprRule({
		reducand: new Expr(Expr.types.AND, [
			new Expr(Expr.types.CONST, [false]),
			new Expr(Expr.types.ANY),
		]),

		reduction: new Expr(Expr.types.CONST, [false]),
	}),

	new ExprRule({
		reducand: new Expr(Expr.types.AND, [
			new Expr(Expr.types.CONST, [true]),
			new Expr(Expr.types.ANY, [0]),
		]),

		reduction: new Expr(Expr.types.ANY, [0]),
	}),
]);

window.Expr = Expr;