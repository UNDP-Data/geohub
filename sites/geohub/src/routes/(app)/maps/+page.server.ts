import type { PageServerLoad } from './$types';
import type { MapsData, TableViewType } from '$lib/types';
import { AccessLevel } from '$lib/config/AppConfig';
import type { UserConfig } from '$lib/config/DefaultUserConfig';

export const load: PageServerLoad = async ({ url, parent, depends, fetch }) => {
	const parentData = await parent();
	const { session } = parentData;
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

	const res = await fetch(`/api/style${apiUrl.search}`);
	const styles: MapsData = await res.json();

	const viewType =
		(url.searchParams.get('viewType') as TableViewType) ?? config.MapPageTableViewType;

	depends('data:styles');
	return {
		styles,
		viewType
	};
};
