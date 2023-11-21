import { StacCatalogs } from '$lib/config/AppConfig';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'STAC Catalog management | GeoHub';
	const content = 'STAC Catalog management';

	return {
		title,
		content,
		stacCatalogs: StacCatalogs
	};
};
