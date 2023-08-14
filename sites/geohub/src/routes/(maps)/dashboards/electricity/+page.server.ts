import type { PageServerLoad } from './$types';
import { ELECTRICITY_DATASETS } from './constansts';
import type { Dataset } from './interfaces';

export const load: PageServerLoad = async ({ fetch }) => {
	const datasets = ELECTRICITY_DATASETS;

	const hrea: Promise<Dataset>[] = [];

	for (const ds of datasets.hrea) {
		hrea.push(
			new Promise<Dataset>((resolve) => {
				fetch(`/api/datasets/${ds.id}`)
					.then((res) => res.json())
					.then((data) => {
						ds.url = data.properties.url;
						resolve(ds);
					});
			})
		);
	}

	const ml: Promise<Dataset>[] = [];

	for (const ds of datasets.ml) {
		ml.push(
			new Promise<Dataset>((resolve) => {
				fetch(`/api/datasets/${ds.id}`)
					.then((res) => res.json())
					.then((data) => {
						ds.url = data.properties.url;
						resolve(ds);
					});
			})
		);
	}

	const hreaData = await Promise.all(hrea);
	const mlData = await Promise.all(ml);

	return {
		datasets: {
			hrea: hreaData,
			ml: mlData
		}
	};
};
