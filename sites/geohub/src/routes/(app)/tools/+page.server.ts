import { ALGORITHM_TAG_KEY } from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
import type { DatasetFeatureCollection, Tag } from '$lib/types';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { type RasterAlgorithm } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch(`/api/tags?key=${ALGORITHM_TAG_KEY}`);
	if (!res.ok) {
		error(res.status, res.statusText);
	}
	const tags: { [key: string]: Tag[] } = await res.json();
	let algoTags = tags[ALGORITHM_TAG_KEY] ?? [];
	algoTags = algoTags.sort((a, b) => a.count - b.count);

	const algorithms = await getAlgorithms(fetch);

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

const getAlgorithms = async (fetch) => {
	const apiUrl = `${env.TITILER_ENDPOINT.replace('/cog', '')}/algorithms`;
	const res = await fetch(apiUrl);
	const algorithms: { [key: string]: RasterAlgorithm } = await res.json();
	return algorithms;
};
