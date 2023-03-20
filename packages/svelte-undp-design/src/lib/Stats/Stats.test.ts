import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Stats from './Stats.svelte';

describe('Stats component', () => {
	it('Should show given stats', async () => {
		const { getAllByText } = render(Stats, {
			props: {
				card: {
					stat: 35,
					title: 'Percents, with very long subheader, spanning several lines',
					description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
				},
				size: 'medium'
			}
		});
		expect(getAllByText('35')).toBeTruthy();
		expect(getAllByText('Percents, with very long subheader, spanning several lines')).toBeTruthy();
		expect(getAllByText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')).toBeTruthy();
	});
});
