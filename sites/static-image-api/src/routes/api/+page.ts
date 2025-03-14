import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'API Docs | Static API';
	const content = 'GeoHub Static API Spec';
	const spec = `/api/openapi.json`;

	return {
		title,
		content,
		spec
	};
};
