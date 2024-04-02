import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { stac, datasetId, isRegistered, dataset } = data;
	const title = `${stac.name} | STAC Catalog management | GeoHub`;
	const content = stac.name;

	return {
		title,
		content,
		stac,
		datasetId,
		isRegistered,
		dataset
	};
};
