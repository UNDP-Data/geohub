import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import VectorDefaultStyle from '$lib/server/defaultStyle/VectorDefaultStyle';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';
import type { DatasetDefaultLayerStyle, DatasetFeature } from '$lib/types';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { createDatasetLinks } from '$lib/server/helpers/createDatasetLinks';
import { ALGORITHM_TAG_KEY } from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const LAYER_TYPES = ['raster', 'fill', 'symbol', 'line', 'circle', 'heatmap'];

export const Output = z.custom<DatasetDefaultLayerStyle>().describe('default layer style');

export const Param = z.object({
	layer: z.string().describe('Band name if it is raster, layer ID if it is vector.'),
	type: z
		.enum(['raster', 'fill', 'symbol', 'line', 'circle', 'heatmap', 'fill-extrusion'])
		.describe('Maplibre layer type (fill, line, symbol, circle, heatmap, raster, fill-extrusion)')
});

export const Query = z.object({
	colormap_name: z
		.string()
		.optional()
		.describe('Option. If specified, use this colormap to create layer style'),
	algorithm: z
		.string()
		.optional()
		.describe('Option. If specified, use this algorithm ID to create raster layer style')
});

export const Input = z.custom<DatasetFeature>().describe('DatasetFeature object');

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Create default layer style for unregistered dataset';
	c.description =
		'This endpoint is to return the default layer style for the dataset which is not registered to the database yet. The response is equivalent to the `/datasets/{id}/style/{layer}/{type}` API. But DatasetFeature object should be in body of POST request.';
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	400: appError(400, 'Invalid parameter')
};

export default new Endpoint({ Param, Query, Output, Modifier, Error }).handle(
	async (param, { request, url, fetch }) => {
		const layer_id = param.layer;
		const layer_type = param.type;
		const colormap_name = url.searchParams.get('colormap_name');
		const algorithm = url.searchParams.get('algorithm');

		if (!LAYER_TYPES.includes(layer_type)) {
			error(404, {
				message: `Invalid parameter of type. It must be one of ${LAYER_TYPES.join(', ')}`
			});
		}

		const body = await request.formData();
		const featureString = body.get('feature') as string;
		const dataset: DatasetFeature = JSON.parse(featureString);

		// set also algorithm to tags, and remove all default algorithm tags associated.
		if (algorithm) {
			if (!dataset.properties.tags) {
				dataset.properties.tags = [];
			}
			dataset.properties.tags = dataset.properties.tags.filter((t) => t.key !== ALGORITHM_TAG_KEY);
			dataset.properties.tags.push({ key: ALGORITHM_TAG_KEY, value: algorithm });
		}

		dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);
		const response = await fetch('/api/settings');
		const config: UserConfig = await response.json();

		let data: DatasetDefaultLayerStyle;
		if (layer_type === 'raster') {
			const bandIndex = parseInt(layer_id) - 1;
			const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
			data = await rasterDefaultStyle.create(colormap_name as string, algorithm as string);
		} else {
			const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
			data = (await vectorDefaultStyle.create(colormap_name as string)) as DatasetDefaultLayerStyle;
		}

		if (!data.metadata) {
			if (layer_type === 'raster') {
				const bandIndex = parseInt(layer_id) - 1;
				const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
				data.metadata = await rasterDefaultStyle.getMetadata(algorithm as string);
			} else {
				const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
				data.metadata = await vectorDefaultStyle.getMetadata();
			}
		}

		return data;
	}
);
