import { StacApis } from '$lib/config/AppConfig';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const id = params.id;
	const stac = StacApis.find((s) => s.id === id && s.type === 'catalog');
	if (!stac) {
		throw error(404, `This stac ID (${id}) is not found.`);
	}
	const title = `${stac.name} | STAC Catalog management | GeoHub`;
	const content = stac.name;

	return {
		title,
		content,
		stac
	};
};
