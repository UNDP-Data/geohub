import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Map | GeoHub';
	const content = 'Map';

	return {
		title,
		content
	};
};
