import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const title = 'GeoHub';
	const content = 'Welcome to GeoHub!';

	return {
		title,
		content,
		stats: data.stats,
		styles: data.styles
	};
};
