import type { Expression } from './expression2cql';

/**
 * Extracts the list of property names used in a MapLibre filter expression.
 *
 * @param {Expression} expression - The MapLibre filter expression.
 * @returns {string[]} - The list of property names used in the expression.
 */
export const expression2fields = (expression: Expression): string[] => {
	// Handle logical expressions (AND/OR)
	if (expression[0] === 'all' || expression[0] === 'any') {
		return expression.slice(1).flatMap((expr) => expression2fields(expr as Expression));
	}

	// Handle NOT expressions
	if (expression[0] === '!') {
		return expression2fields(expression[1] as Expression);
	}

	// Handle IN expressions
	if (expression[0] === 'in') {
		return [expression[1][1]];
	}

	// Handle single condition expressions (e.g. ==, !=, >, <)
	const getExpression = expression[1];
	if (Array.isArray(getExpression) && getExpression[0] === 'get') {
		return [getExpression[1]];
	}

	return [];
};
