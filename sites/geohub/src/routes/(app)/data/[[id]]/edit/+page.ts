import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { feature, isNew, continents, regions, countries } = data;
	const title = 'Data publish | GeoHub';
	const content = 'Data publish';

	return {
		title,
		content,
		feature,
		continents,
		regions,
		countries,
		isNew
	};
};
