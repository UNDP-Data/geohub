import { describe, it, expect } from 'vitest';
import { expression2fields } from './expression2fields';
import type { Expression } from './expression2cql';

describe('expression2fields', () => {
	it('should extract fields from a single equality expression', () => {
		const expression: Expression = ['==', ['get', 'district'], 'NYAGATARE'];

		const result = expression2fields(expression);
		expect(result).toEqual(['district']);
	});

	it('should extract fields from a single inequality expression', () => {
		const expression: Expression = ['!=', ['get', 'condition'], 'Normal'];

		const result = expression2fields(expression);
		expect(result).toEqual(['condition']);
	});

	it('should extract fields from an IN expression', () => {
		const expression: Expression = [
			'in',
			['get', 'district'],
			['literal', ['NYAGATARE', 'KIGALI', 'BUTARE']]
		];

		const result = expression2fields(expression);
		expect(result).toEqual(['district']);
	});

	it('should extract fields from a NOT IN expression', () => {
		const expression: Expression = [
			'!',
			['in', ['get', 'district'], ['literal', ['NYAGATARE', 'KIGALI', 'BUTARE']]]
		];

		const result = expression2fields(expression);
		expect(result).toEqual(['district']);
	});

	it('should extract fields from an AND expression', () => {
		const expression: Expression = [
			'all',
			['==', ['get', 'district'], 'NYAGATARE'],
			['!=', ['get', 'condition'], 'Normal']
		];

		const result = expression2fields(expression);
		expect(result).toEqual(['district', 'condition']);
	});

	it('should extract fields from an OR expression', () => {
		const expression: Expression = [
			'any',
			['==', ['get', 'district'], 'NYAGATARE'],
			['>', ['get', 'population'], 1000]
		];

		const result = expression2fields(expression);
		expect(result).toEqual(['district', 'population']);
	});

	it('should return an empty array for an empty expression', () => {
		const expression: Expression = ['all'];

		const result = expression2fields(expression);
		expect(result).toEqual([]);
	});
});
