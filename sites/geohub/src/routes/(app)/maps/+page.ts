import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { styles } = data;
	const title = 'Maps | GeoHub';
	const content = 'Explore maps';

	return {
		title,
		content,
		styles
	};
};
