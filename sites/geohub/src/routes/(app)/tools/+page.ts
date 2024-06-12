import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { algorithms, datasets } = data;
	const title = 'Tools | GeoHub';
	const content = 'Tools';

	return {
		title,
		content,
		algorithms,
		datasets
	};
};
