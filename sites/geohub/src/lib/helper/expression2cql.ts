// Supported operators
const VectorFilterOperators = [
	{ value: '==', symbol: '=' },
	{ value: '!=', symbol: '<>' },
	{ value: '>', symbol: '>' },
	{ value: '<', symbol: '<' },
	{ value: 'in', symbol: 'IN' }
];

// Operator type definition
export type Operator = '==' | '!=' | '>' | '<' | 'in';

// Type definition for single condition expression
export type ConditionExpression = [
	Operator,
	['get', string],
	string | number | (string | number)[]
];

// Type definition for logical expressions ("all" for AND, "any" for OR)
export type LogicExpression = ['all' | 'any', ...Expression[]];

// Type definition for IN expression
export type InExpression = ['in', ['get', string], ['literal', (string | number)[]]];

// Type definition for NOT IN expression
export type NotInExpression = ['!', InExpression];

// Type definition for an expression (either a single condition, logical operation, IN, or NOT IN)
export type Expression = ConditionExpression | LogicExpression | InExpression | NotInExpression;

/**
 * Converts a MapLibre filter operator to a CQL operator symbol.
 *
 * @param {Operator} operator - The MapLibre filter operator.
 * @returns {string} - The corresponding CQL operator symbol.
 * @throws {Error} - If the operator is unsupported.
 */
const convertOperatorToCQL = (operator: Operator): string => {
	const op = VectorFilterOperators.find((op) => op.value === operator);
	if (!op) throw new Error(`Unsupported operator: ${operator}`);
	return op.symbol;
};

/**
 * Converts a MapLibre filter expression to a CQL string.
 *
 * This function supports logical AND (`all`) and OR (`any`) expressions as well as single condition expressions.
 *
 * @param {Expression} expression - The MapLibre filter expression.
 * @returns {string} - The corresponding CQL string.
 * @throws {Error} - If the value for an `in` or `!in` operator is not an array.
 */
export const expression2cql = (expression: Expression): string => {
	if (!Array.isArray(expression)) return '';
	// Handle "all" (AND) condition
	if (expression[0] === 'all') {
		const conditions = expression.slice(1).map((expr) => expression2cql(expr as Expression));
		return conditions.join(' AND ');
	}

	// Handle "any" (OR) condition
	if (expression[0] === 'any') {
		const conditions = expression.slice(1).map((expr) => expression2cql(expr as Expression));
		return conditions.join(' OR ');
	}

	// Handle IN condition
	if (expression[0] === 'in') {
		const property = expression[1][1];
		let value: (string | number)[] | string | number;
		if (Array.isArray(expression[2]) && expression[2][0] === 'literal') {
			value = expression[2][1] as (string | number)[] | string | number;
		} else {
			throw new Error('Invalid IN expression format');
		}
		if (!Array.isArray(value)) {
			value = [value];
		}
		return `${property} IN (${value.map((v) => `'${v}'`).join(', ')})`;
	}

	// Handle NOT IN condition
	if (expression[0] === '!') {
		const inExpression = expression[1] as InExpression;
		const property = inExpression[1][1];
		const value = inExpression[2][1];
		return `${property} NOT IN (${value.map((v) => `'${v}'`).join(', ')})`;
	}

	// Handle single condition
	const operator = expression[0];
	const property = expression[1][1];
	const value = expression[2];

	const cqlOperator = convertOperatorToCQL(operator);

	// Default case for other operators
	return `${property} ${cqlOperator} '${value}'`;
};
