import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Settings | GeoHub';
	const content = 'Settings';

	return {
		title,
		content
	};
};
