import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const title = 'API Docs | Static API';
	const content = 'GeoHub Static API Spec';
	const spec = `${url.origin}/api/swagger/spec.json`;

	return {
		title,
		content,
		spec
	};
};
