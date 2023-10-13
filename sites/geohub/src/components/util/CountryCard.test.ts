import { describe, beforeEach, it, expect } from 'vitest';
import { render, type RenderResult } from '@testing-library/svelte';
import CountryCard from '$components/util/CountryCard.svelte';
import type { Country } from '$lib/types';

const exampleCountry: Country = {
	iso_3: 'AFG',
	iso_code: 4,
	iso_2: 'AF',
	country_name: 'Afghanistan',
	region_code: 142,
	region_name: 'Asia',
	continent_code: 142,
	continent_name: 'Asia'
};

describe('CountryCard component', () => {
	let component: RenderResult<CountryCard>;
	beforeEach(() => {
		component = render(CountryCard, {
			props: {
				country: exampleCountry,
				isSelectable: true,
				isSelected: false
			}
		});
	});

	it('should render the component', () => {
		component.getByTestId('country-card-container');
		expect(component.container).toBeDefined();
	});
	it('should dispatch a click event when selected', async () => {
		component = render(CountryCard, {
			props: {
				country: exampleCountry,
				isSelectable: true,
				isSelected: false
			}
		});
		component.component.$on('click', () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(component.component.$$.ctx.isSelected).toBe(true);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(component.component.$$.ctx.country).toBe(exampleCountry);
		});
	});
});
