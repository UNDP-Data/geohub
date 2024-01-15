import type { PageServerLoad } from './$types';
import type { StacCollection } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { stac } = await parent();

	const apiUrl = `${stac.url}/collections`;
	const collection = params.collection;

	const url = `${apiUrl}/${collection}`;
	const res = await fetch(url);
	if (!res.ok) {
		if (res.status === 404) {
			error(res.status, `No collection found.`);
		} else {
			error(res.status, res.statusText);
		}
	}

	const json: StacCollection = await res.json();

	return {
		collection: json
	};
};
