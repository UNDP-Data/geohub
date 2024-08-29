import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	const title = 'pg_tileserv management | GeoHub';
	const content = 'pg_tileserv management';
	return {
		title,
		content,
		pgtileservUrl: env.PGTILESERV_API_ENDPOINT
	};
};
