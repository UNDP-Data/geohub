import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { stories } = data;
	const title = 'Storymaps | GeoHub';
	const content = 'Explore storymaps';

	return {
		title,
		content,
		stories
	};
};
