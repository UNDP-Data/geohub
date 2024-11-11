import type { Feature } from 'geojson';

/**
 * parse the given CQL filter string to return only matched objects
 *
 * Only the following operators are currently supported
 * EQUAL TO [ = ], LESS THAN [ < ], LESS THAN OR EQUAL TO [ <= ], GREATER THAN [ > ], GREATER THAN OR EQUAL TO [ >= ], IS NULL, LIKE, IN, NOT IN, BETWEEN
 * AND, OR, NOT [ <> ]
 *
 * @param cqlFilter CQL filter string
 * @param data an array of GeoJSON feature object
 * @returns filtered data
 */
export const parseCqlFilter = (cqlFilter: string, data: Feature[]): Feature[] => {
	const conditions = cqlFilter
		.replace(/(\w+)\s+BETWEEN\s+\S+\s+AND\s+\S+/g, (match) => {
			return match.replace(/\s+AND\s+/g, ' BETWEEN_AND');
		})
		.split(/\s+(AND|OR)\s+/)
		.map((condition) => condition.replace('BETWEEN_AND', 'AND '))
		.filter(Boolean);

	const filteredData: Feature[] = [];

	for (const item of data) {
		let result = false;
		for (let i = 0; i < conditions.length; i++) {
			const cond = conditions[i].trim();

			if (cond === 'AND') {
				continue;
			} else if (cond === 'OR') {
				continue;
			} else {
				const isMatched = evaluateCondition(item, cond);

				const previous = conditions[i - 1];
				if (previous === 'AND') {
					result = result && isMatched;
				} else if (previous === 'OR') {
					result = result || isMatched;
				} else {
					result = isMatched;
				}
			}
		}
		if (result === true) {
			filteredData.push(item);
		}
	}

	return filteredData;
};

const evaluateCondition = (item: Feature, condition: string): boolean => {
	const regexNotIn = /([\w\s]+)\s*(NOT IN)\s*(.*)/;
	let match = condition.trim().match(regexNotIn);
	if (!match) {
		const regex = /([\w\s]+)\s*(<=|>=|<>|=|<|>|LIKE|IN|IS NULL|BETWEEN)\s*(.*)/;
		match = condition.trim().match(regex);
	}

	// console.log(match);
	if (!match) return false;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, field, operator, value] = match;

	if (!item.properties) return false;
	const targetField = Object.keys(item.properties).find(
		(key) => key.toLowerCase() === field.toLowerCase().trim()
	);
	if (!targetField) return false;
	let targetProp = item.properties[targetField];
	if (typeof targetProp === 'string') {
		targetProp = targetProp.toLowerCase();
	}

	if (operator === 'IN' || operator === 'NOT IN') {
		const values = value
			.replace(/[()']/g, '')
			.split(',')
			.map((v) => v.trim().toLowerCase());
		const isIn = values.includes(targetProp?.toString());
		return operator === 'IN' ? isIn : !isIn;
	} else if (operator === 'BETWEEN') {
		const [minValue, maxValue] = value.split('AND').map((v) => v.trim());
		if (isNaN(Number(minValue)) || isNaN(Number(maxValue))) return false;
		const min = Number(minValue);
		const max = Number(maxValue);
		return typeof targetProp === 'number' && targetProp >= min && targetProp <= max;
	}

	const processedValue: string | number = isNaN(Number(value))
		? value.replace(/'/g, '').toLowerCase()
		: Number(value);

	switch (operator) {
		case '=':
			return targetProp === processedValue;
		case '<':
			return targetProp < processedValue;
		case '<=':
			return targetProp <= processedValue;
		case '>':
			return targetProp > processedValue;
		case '>=':
			return targetProp >= processedValue;
		case '<>':
			return targetProp !== processedValue;
		case 'IS NULL':
			return targetProp === null || targetProp === undefined;
		case 'LIKE':
			return targetProp?.toString().indexOf(processedValue) !== -1;
		default:
			return false;
	}
};
