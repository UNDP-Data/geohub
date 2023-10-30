import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { pgtileservUrl } = data;
	const title = 'pg_tileserv management | GeoHub';
	const content = 'pg_tileserv management';

	return {
		title,
		content,
		pgtileservUrl
	};
};
