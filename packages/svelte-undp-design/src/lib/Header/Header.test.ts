import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Header from './Header.svelte';

describe('Header component', () => {
	it('Should show given information in header', async () => {
		const { getAllByText } = render(Header, {
			props: {
				region: 'REGION',
				siteTitle: 'Site Title',
				url: 'https://undpgeohub.org',
				logoUrl: 'assets/undp-logo-blue.svg',
				showProgressBar: false,
				links: [
					{
						id: 'headerLink1',
						title: 'Link 1',
						href: '#'
					}
				],
				progressBarSize: 'small',
				isPositionFixed: false
			}
		});
		expect(getAllByText('REGION')).toBeTruthy();
		expect(getAllByText('Site Title')).toBeTruthy();
		// expect(getAllByText('Link 1')).toBeTruthy();
	});
});
