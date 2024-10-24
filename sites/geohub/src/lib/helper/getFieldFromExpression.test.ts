import { describe, it, expect } from 'vitest';
import { getFieldFromExpression } from './getFieldFromExpression';

describe('getFieldFromExpression', () => {
	it('should extract field from expression using coalesce', () => {
		const expression = [
			'step',
			['coalesce', ['get', 'perc_flooded_buildings'], 0],
			'#f7fcf0',
			1.76,
			'#d4eece',
			3.53,
			'#9fdab8',
			5.29,
			'#57b8d0',
			7.06,
			'#1d7eb7'
		] as string | string[];
		const result = getFieldFromExpression(expression);
		expect(result).toEqual('perc_flooded_buildings');
	});

	it('should extract field from expression without coalesce', () => {
		const expression = [
			'step',
			['get', 'perc_flooded_buildings'],
			'#f7fcf0',
			1.76,
			'#d4eece',
			3.53,
			'#9fdab8',
			5.29,
			'#57b8d0',
			7.06,
			'#1d7eb7'
		] as string | string[];
		const result = getFieldFromExpression(expression);
		expect(result).toEqual('perc_flooded_buildings');
	});

	it('should return empty string if it is not step expression', () => {
		const expression = '#f7fcf0' as string;
		const result = getFieldFromExpression(expression);
		expect(result).toEqual('');
	});
});
