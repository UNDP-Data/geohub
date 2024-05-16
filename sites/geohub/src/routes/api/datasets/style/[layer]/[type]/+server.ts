import { createDatasetLinks } from '$lib/server/helpers';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import type { DatasetDefaultLayerStyle, DatasetFeature } from '$lib/types';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { env } from '$env/dynamic/private';
import VectorDefaultStyle from '$lib/server/defaultStyle/VectorDefaultStyle';

const LAYER_TYPES = ['raster', 'fill', 'symbol', 'line', 'circle', 'heatmap'];

export const POST: RequestHandler = async ({ request, params, url, fetch }) => {
	const layer_id = params.layer;
	const layer_type = params.type;
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
	dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);

	const response = await fetch('/api/settings');
	const config: UserConfig = await response.json();

	let data: DatasetDefaultLayerStyle;
	if (layer_type === 'raster') {
		const bandIndex = parseInt(layer_id) - 1;
		const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
		data = await rasterDefaultStyle.create(colormap_name, algorithm);
	} else {
		const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
		data = await vectorDefaultStyle.create(colormap_name);
	}

	if (!data.metadata) {
		if (layer_type === 'raster') {
			const bandIndex = parseInt(layer_id) - 1;
			const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
			data.metadata = await rasterDefaultStyle.getMetadata(algorithm);
		} else {
			const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
			data.metadata = await vectorDefaultStyle.getMetadata();
		}
	}

	return new Response(JSON.stringify(data));
};
