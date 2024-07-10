import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { azureUrl, titilerUrl } = data;
	const title = 'Electricity Dashboard | GeoHub';
	const content = 'Electricity dashboard';
	const site_description = `The 'Affordable and clean energy' dashboard helps identify vulnerable areas in the world that have limited or no access to energy.`;

	return {
		title,
		content,
		site_description,
		titilerUrl,
		socialImage: `/assets/electricity-snapshot.png`,
		azureUrl
	};
};
