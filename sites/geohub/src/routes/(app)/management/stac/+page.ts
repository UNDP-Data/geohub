import { StacApis } from '$lib/config/AppConfig';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'STAC management | GeoHub';
	const content = 'STAC management';

	return {
		title,
		content,
		stacs: StacApis
	};
};
