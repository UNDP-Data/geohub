import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { stats, styles } = data;
	const title = 'GeoHub';
	const content = 'Welcome to GeoHub!';

	return {
		title,
		content,
		stats,
		styles
	};
};
