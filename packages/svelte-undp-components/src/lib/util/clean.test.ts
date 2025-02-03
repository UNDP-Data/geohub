import { describe, expect, it } from 'vitest';

import { clean } from './clean';

describe('clean', () => {
	it('should remove underscore characters', () => {
		const value = clean(
			'Proportion_of_local_governments_implementing_local_disaster_risk_reduction_strategies'
		);
		expect(value).toEqual(
			'Proportion Of Local Governments Implementing Local Disaster Risk Reduction Strategies'
		);
	});

	it('should remove hyphen characters', () => {
		const value = clean('climate-action-plan');
		expect(value).toEqual('Climate Action Plan');
	});

	it('should remove extension', () => {
		const file = clean('AUTOEXEC.BAT');
		expect(file).toEqual('AUTOEXEC');

		const file1 = clean('wEb.html');
		expect(file1).toEqual('WEb');
	});

	it('should apply start case', () => {
		const file = clean('AUTOEXEC.BAT');
		expect(file).toEqual('AUTOEXEC');

		const file1 = clean('wEb.html');
		expect(file1).toEqual('WEb');
	});

	it('should remove underscores, extension and apply start/title case', () => {
		const value = clean(
			'Biotic_genetic_resources_for_food_and_agriculture_secured_in_conservation_facilities.tif'
		);
		expect(value).toEqual(
			'Biotic Genetic Resources For Food And Agriculture Secured In Conservation Facilities'
		);
	});
});
