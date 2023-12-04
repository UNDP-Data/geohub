import type { PageServerLoad } from './$types';
import { getDatasetStats } from '$lib/server/helpers';
import type { MapsData } from '$lib/types';
import { AccessLevel } from '$lib/config/AppConfig';
import type { UserConfig } from '$lib/config/DefaultUserConfig';

export const load: PageServerLoad = async ({ locals, url, parent, depends, fetch }) => {
	const session = await locals.getSession();

	const parentData = await parent();
	const config: UserConfig = parentData.config;

	const apiUrl = new URL(url);

	// reset default query params if it is not in queryparams
	const sortby = url.searchParams.get('sortby');
	if (!sortby) {
		apiUrl.searchParams.set('sortby', config.MapPageSortingColumn);
	}
	const limit = url.searchParams.get('limit');
	if (!limit) {
		apiUrl.searchParams.set('limit', `${config.MapPageSearchLimit}`);
	}
	const offset = url.searchParams.get('offset');
	if (!offset) {
		apiUrl.searchParams.set('offset', `0`);
	}

	const accesslevel: string = url.searchParams.get('accesslevel');
	if (!session) {
		apiUrl.searchParams.set('accesslevel', `${AccessLevel.PUBLIC}`);
	} else if (!accesslevel) {
		apiUrl.searchParams.set('accesslevel', `${AccessLevel.PRIVATE}`);
	}

	const dataset_stats = await getDatasetStats();

	const res = await fetch(`/api/style${apiUrl.search}`);
	const styles: MapsData = await res.json();

	depends('data:styles');
	return {
		stats: {
			dataset: dataset_stats
		},
		styles
	};
};
