import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Management | GeoHub';
	const content = 'GeoHub Management';

	return {
		title,
		content
	};
};
