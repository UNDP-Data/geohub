import type { PageLoad } from '../../api/$types';

export const load: PageLoad = async () => {
	const title = 'API Docs | GeoHub';
	const spec = '/api/swagger/spec.json';

	return {
		title,
		spec
	};
};
