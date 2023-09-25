import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'API Docs | GeoHub';
	const content = 'GeoHub API Spec';
	const spec = '/api/swagger/spec.json';

	return {
		title,
		content,
		spec
	};
};

// export const csr = true;
// export const ssr = false;
