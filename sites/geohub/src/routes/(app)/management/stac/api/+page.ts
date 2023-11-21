import { StacApis } from '$lib/config/AppConfig';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'STAC API management | GeoHub';
	const content = 'STAC API management';

	return {
		title,
		content,
		stacApis: StacApis
	};
};
