import type { PageServerLoad } from './$types';
import { getMapStats } from '$lib/server/helpers';
import type { MapsData } from '$lib/types';
import { AccessLevel } from '$lib/config/AppConfig';
import type { UserConfig } from '$lib/config/DefaultUserConfig';

export const load: PageServerLoad = async (event) => {
	const { locals, url, parent } = event;
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

	const map_stats = getMapStats();

	const styles = getMapData(event.fetch, `/api/style${apiUrl.search}`);

	return {
		promises: {
			stats: map_stats,
			styles
		}
	};
};

const getMapData = async (
	fetch: (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>,
	url: string
) => {
	const res = await fetch(url);
	const styles: MapsData = await res.json();
	return styles;
};
