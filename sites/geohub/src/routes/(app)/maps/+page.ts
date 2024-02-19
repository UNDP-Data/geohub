import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { styles } = data;
	const title = 'Maps | GeoHub';
	const content = 'Maps';

	return {
		title,
		content,
		styles
	};
};
