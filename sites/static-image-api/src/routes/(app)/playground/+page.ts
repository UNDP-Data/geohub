import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Playground | GeoHub Static API';

	return {
		title
	};
};
