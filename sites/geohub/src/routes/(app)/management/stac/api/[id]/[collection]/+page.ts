import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, parent }) => {
	const { stac } = await parent();
	const { collection } = data;
	const title = `${collection.title} | STAC management | GeoHub`;
	const content = collection.title;

	return {
		title,
		content,
		stac,
		collection
	};
};
