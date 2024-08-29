import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const title = 'CEEI Dashboard | GeoHub';
	const content = 'CEEI dashboard';
	const site_description = `This dashboard maps the Clean Energy Equity Index (CEEI) for the area. The dashboard allows the user to adjust the data computation to simulate various scenarios for the CEEI value.`;

	return {
		title,
		content,
		site_description,
		socialImage: `${url.origin}/assets/ceei-snapshot.png`
	};
};
