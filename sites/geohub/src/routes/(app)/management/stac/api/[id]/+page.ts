import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { stac } = await parent();
	const title = `${stac.name} | STAC API management | GeoHub`;
	const content = stac.name;

	return {
		title,
		content,
		stac
	};
};
