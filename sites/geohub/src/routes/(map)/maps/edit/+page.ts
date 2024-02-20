import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'New Map | GeoHub';
	const content = 'Create a new map';

	return {
		title,
		content
	};
};
