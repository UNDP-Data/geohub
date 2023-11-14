/**
 * Covert deprecated function to maplibre expression
 * @param value property value
 */
export const convertFunctionToExpression = (value: unknown, defaultValue: unknown) => {
	if (typeof value === 'object') {
		const property: string = 'property' in value ? (value.property as string) : undefined;
		if (!property) return value;

		const fallbackValue: unknown = 'default' in value ? (value.default as string) : defaultValue;

		if ('type' in value && value.type === 'interval') {
			const steps: unknown[] = ['step', ['get', property]];

			if ('stops' in value && Array.isArray(value.stops)) {
				for (let i = 0; i < value.stops.length; i++) {
					const stop = value.stops[i];
					const c: string = stop[1];
					const v: number = stop[0];
					steps.push(c);
					if (i !== value.stops.length - 1) {
						steps.push(v);
					}
				}
			}
			return steps;
		} else if ('type' in value && value.type === 'categorical') {
			const steps: unknown[] = ['match', ['get', property]];

			if ('stops' in value && Array.isArray(value.stops)) {
				for (const stop of value.stops) {
					const c: string = stop[1];
					const v: number = stop[0];
					steps.push(v);
					steps.push(c);
				}
				steps.push(fallbackValue);
			}
			return steps;
		}
	} else {
		return value;
	}
};
