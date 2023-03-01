import { ELECTRICITY_DATASETS } from '$lib';
import type { PageServerLoad } from './$types';

const API_URL = 'https://dev.undpgeohub.org/api/datasets/';

export const load: PageServerLoad = async (event) => {
	const datasets = JSON.parse(JSON.stringify(ELECTRICITY_DATASETS));

	for (const ds of datasets.hrea) {
		const res = await event.fetch(`${API_URL}${ds.id}`);
		const json = await res.json();
		ds.url = json.properties.url;
	}

	for (const ds of datasets.ml) {
		const res = await event.fetch(`${API_URL}${ds.id}`);
		const json = await res.json();
		ds.url = json.properties.url;
	}

	return {
		datasets
	};
};
