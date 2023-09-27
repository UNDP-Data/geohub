import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { azureUrl, titilerUrl } = data;
	const title = 'Electricity Dashboard | GeoHub';
	const content = 'Electricity dashboard';

	return {
		title,
		content,
		titilerUrl,
		azureUrl
	};
};
