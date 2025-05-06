import { ALGORITHM_TAG_KEY } from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
import type { DatasetFeatureCollection, Tag } from '$lib/types';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { type RasterAlgorithm } from '@undp-data/svelte-undp-components';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch(`/api/tags?key=${ALGORITHM_TAG_KEY}`);
	if (!res.ok) {
		error(res.status, res.statusText);
	}
	const tags: { [key: string]: Tag[] } = await res.json();
	let algoTags = tags[ALGORITHM_TAG_KEY] ?? [];
	algoTags = algoTags.sort((a, b) => a.count - b.count);

	let algorithms: { [key: string]: RasterAlgorithm } = {};
	try {
		const apiUrl = `${env.TITILER_ENDPOINT.replace('/cog', '')}/algorithms`;
		const resAlgo = await fetch(apiUrl);
		algorithms = await resAlgo.json();
	} catch (error) {
		console.error('Error fetching algorithms:', error);
		algorithms = {};
	}

	const filteredAlgos: { [key: string]: RasterAlgorithm } = {};

	algoTags.forEach((tag) => {
		if (Array.isArray(tag.value)) return;
		if (!algorithms[tag.value]) return;
		filteredAlgos[tag.value] = algorithms[tag.value];
	});

	// get dynamic similation datasets
	const resDynamic = await fetch(
		`/api/datasets?type=pgtileserv&layertype=function&query=dynamic&limit=999`
	);
	const dynamicDatasets: DatasetFeatureCollection = await resDynamic.json();

	const title = 'Tools | GeoHub';
	const content = 'Tools';

	return {
		title,
		content,
		algorithms: filteredAlgos,
		datasets: dynamicDatasets
	};
};
