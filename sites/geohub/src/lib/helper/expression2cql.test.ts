import { describe, it, expect } from 'vitest';
import { expression2cql, type Expression } from './expression2cql';

describe('expression2cql', () => {
	it('should convert equality expressions correctly', () => {
		const expression: Expression = ['==', ['get', 'district'], 'NYAGATARE'];
		const result = expression2cql(expression);
		expect(result).toBe("district = 'NYAGATARE'");
	});

	it('should convert inequality expressions correctly', () => {
		const expression: Expression = ['!=', ['get', 'condition'], 'Normal'];
		const result = expression2cql(expression);
		expect(result).toBe("condition != 'Normal'");
	});

	it('should convert greater than expressions correctly', () => {
		const expression: Expression = ['>', ['get', 'population'], 1000];
		const result = expression2cql(expression);
		expect(result).toBe("population > '1000'");
	});

	it('should convert less than expressions correctly', () => {
		const expression: Expression = ['<', ['get', 'population'], 500];
		const result = expression2cql(expression);
		expect(result).toBe("population < '500'");
	});

	it('should convert IN expressions correctly', () => {
		const expression: Expression = [
			'in',
			['get', 'district'],
			['literal', ['NYAGATARE', 'KIGALI', 'BUTARE']]
		];
		const result = expression2cql(expression);
		expect(result).toBe("district IN ('NYAGATARE', 'KIGALI', 'BUTARE')");
	});

	it('should convert NOT IN expressions correctly', () => {
		const expression: Expression = [
			'!',
			['in', ['get', 'district'], ['literal', ['NYAGATARE', 'KIGALI', 'BUTARE']]]
		];
		const result = expression2cql(expression);
		expect(result).toBe("district NOT IN ('NYAGATARE', 'KIGALI', 'BUTARE')");
	});

	it('should convert AND expressions correctly', () => {
		const expression: Expression = [
			'all',
			['==', ['get', 'district'], 'NYAGATARE'],
			['==', ['get', 'condition'], 'Normal']
		];
		const result = expression2cql(expression);
		expect(result).toBe("district = 'NYAGATARE' AND condition = 'Normal'");
	});

	it('should convert OR expressions correctly', () => {
		const expression: Expression = [
			'any',
			['==', ['get', 'district'], 'NYAGATARE'],
			['==', ['get', 'condition'], 'Normal']
		];
		const result = expression2cql(expression);
		expect(result).toBe("district = 'NYAGATARE' OR condition = 'Normal'");
	});
});
