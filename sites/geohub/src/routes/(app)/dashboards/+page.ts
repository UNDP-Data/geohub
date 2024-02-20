import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = `Dashboards | GeoHub`;
	const content = 'Explore dashboard';

	return {
		title,
		content
	};
};
