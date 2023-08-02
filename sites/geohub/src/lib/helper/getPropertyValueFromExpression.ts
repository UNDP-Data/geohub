import type { LayerSpecification } from 'maplibre-gl';

export const getPropertyValueFromExpression = (
	style: LayerSpecification,
	propertyName: string,
	type: 'layout' | 'paint' = 'layout'
) => {
	let value = '';
	if (style && style[type] && style[type][propertyName]) {
		const values = style[type][propertyName];
		for (let i = 0; i < values.length; i++) {
			const expression = values[i];
			if (Array.isArray(expression)) {
				if (expression[0] === 'get') {
					value = expression[1];
					break;
				}
			} else if (expression === 'get') {
				value = values[i + 1];
				break;
			}
		}
	}
	return value;
};
