import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { licenses } = data;
	const title = 'License | GeoHub';
	const content = 'License';

	return {
		title,
		content,
		licenses
	};
};
