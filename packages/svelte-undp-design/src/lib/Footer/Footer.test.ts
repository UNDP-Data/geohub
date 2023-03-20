import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Footer from './Footer.svelte';

const footerItems: { [key: string]: { title: string; url: string }[] } = {
	GeoHub: [
		{
			title: 'GeoHub',
			url: 'https://geohub.data.undp.org'
		},
		{
			title: 'GeoHub dashboard',
			url: 'https://geohub.data.undp.org/dashboards'
		},
		{
			title: 'GeoHub electricity dashboard',
			url: 'https://geohub.data.undp.org/dashboards/electricity'
		}
	]
};

describe('Footer component', () => {
	it('Should show given information in footer item', async () => {
		const { getAllByText } = render(Footer, {
			props: { footerItems: footerItems, logoUrl: 'assets/undp-logo-white.svg' }
		});
		expect(getAllByText('GeoHub')).toBeTruthy();
		expect(getAllByText('GeoHub dashboard')).toBeTruthy();
		expect(getAllByText('GeoHub electricity dashboard')).toBeTruthy();

		expect(getAllByText('twitter')).toBeTruthy();
		expect(getAllByText('facebook')).toBeTruthy();
		expect(getAllByText('instagram')).toBeTruthy();
		expect(getAllByText('linkedIn')).toBeTruthy();
		expect(
			getAllByText(`© ${new Date().getFullYear()} United Nations Development Programme`)
		).toBeTruthy();
	});
});
