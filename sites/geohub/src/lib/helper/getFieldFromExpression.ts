/**
 * get property string from maplibre expression with/without coalesce
 * @param value maplibre expression
 * @returns return property string
 */
export const getFieldFromExpression = (value: string | string[]) => {
	if (Array.isArray(value)) {
		const fieldExpr = value[1];
		if (fieldExpr[0] === 'coalesce') {
			return fieldExpr[1][1] as string;
		} else {
			return fieldExpr[1] as string;
		}
	} else {
		return '';
	}
};
