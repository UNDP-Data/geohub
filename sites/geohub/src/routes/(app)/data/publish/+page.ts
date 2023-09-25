import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { feature, promises, isNew } = data;
	const title = 'Data publish | GeoHub';
	const content = 'Data publish';

	return {
		title,
		content,
		feature,
		promises,
		isNew
	};
};
