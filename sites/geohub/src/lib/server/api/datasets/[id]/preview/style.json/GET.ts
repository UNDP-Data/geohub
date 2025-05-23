import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { createDatasetLinks, getDatasetById, isSuperuser } from '$lib/server/helpers';
import { env } from '$env/dynamic/private';
import type { DatasetDefaultLayerStyle, VectorLayerTypes } from '$lib/types';
import { v4 as uuidv4 } from 'uuid';
import type { StyleSpecification } from 'maplibre-gl';
import { MapStyles } from '$lib/config/AppConfig';
import geoViewport from '@mapbox/geo-viewport';
import { error } from '@sveltejs/kit';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';

export const Output = z.custom<StyleSpecification>().describe('Maplibre style json');

export const Param = z.object({
	id: z.string().describe('Dataset ID')
});

export const Query = z.object({
	layer: z.string().optional().describe('Band name if it is raster, layer ID if it is vector.'),
	type: z
		.enum(['fill', 'line', 'symbol', 'circle', 'heatmap', 'fill-extrusion', 'raster'])
		.optional()
		.describe('Maplibre layer type (fill, line, symbol, circle, heatmap, raster, fill-extrusion)')
});

const description = `
This endpoint is to create a style.json with default style for the dataset preview.

If \`type\` is not specified, the layer type will be assumed by the geometry type of the layer.

If \`layer\` is not specified, the first layer (if vector) or the first band (if raster) will be used.
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get maplibre style.json for preview map';
	c.description = description;
	c.tags = ['datasets'];
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	400: appError(400, 'Invalid parameter')
};

export default new Endpoint({ Param, Query, Output, Modifier, Error }).handle(
	async (param, { locals, url, fetch }) => {
		const session = await locals.auth();
		const user_email = session?.user.email;
		const id = param.id;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		let layer_id = url.searchParams.get('layer');
		let layer_type: VectorLayerTypes | 'raster' = url.searchParams.get('type') as
			| VectorLayerTypes
			| 'raster';

		const dataset = await getDatasetById(id, is_superuser, user_email);
		if (!dataset) {
			error(404, { message: `No dataset found.` });
		}

		const styleJson: StyleSpecification = {
			version: 8,
			name: dataset.properties.name,
			center: [0, 0],
			zoom: 0,
			bearing: 0,
			pitch: 0,
			sources: {},
			layers: [
				{
					id: 'background',
					type: 'background',
					layout: {
						visibility: 'visible'
					},
					paint: {
						'background-color': '#fbf8f3',
						'background-opacity': 1
					}
				}
			]
		};

		const isStac = dataset.properties.tags?.find((t) => t.key === 'type')?.value === 'stac';
		if (isStac) {
			// if STAC dataset, return the empty style json
			return styleJson;
		}

		if (dataset.properties.is_raster) {
			// raster
			if (!layer_id) {
				layer_id = layer_id ?? '1';
			}
			layer_type = 'raster';
		} else {
			// vector
			dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);
			const metadataJsonUrl = dataset.properties.links?.find((l) => l.rel === 'metadatajson')?.href;
			const res = await fetch(metadataJsonUrl as string);
			if (!res.ok) {
				error(res.status, res.statusText);
			}
			const metadata: VectorTileMetadata = await res.json();
			if (!layer_id) {
				layer_id = metadata.json?.vector_layers[0].id as string;
			}
			if (!layer_type) {
				const tilestats = metadata.json?.tilestats?.layers.find((l) => l.layer === layer_id);

				const geomType = tilestats?.geometry.toLowerCase();
				if (geomType === 'point' || geomType === 'multipoint') {
					layer_type = 'symbol';
				} else if (geomType === 'linestring' || geomType === 'multilinestring') {
					layer_type = 'line';
				} else {
					layer_type = 'fill';
				}
			}

			if (['symbol'].includes(layer_type)) {
				const resBaseStyle = await fetch(MapStyles[0].uri);
				const baseStyle: StyleSpecification = await resBaseStyle.json();
				styleJson.sprite = baseStyle.sprite;
			}
		}

		const styleApi = `/api/datasets/${id}/style/${layer_id}/${layer_type}`;
		const res = await fetch(styleApi);
		if (!res.ok) {
			error(res.status, res.statusText);
		}
		const datasetStyle: DatasetDefaultLayerStyle = await res.json();

		const tileSourceId = dataset.properties.id;
		const layerId = uuidv4();

		const layerSpec = JSON.parse(
			JSON.stringify(datasetStyle.style)
				.replace('{source_id}', tileSourceId as string)
				.replace('{layer_id}', layerId)
		);
		const sourceSpec = JSON.parse(JSON.stringify(datasetStyle.source));

		const coordinates = dataset.geometry?.coordinates[0] as [number, number][];
		const pos = geoViewport.viewport([...coordinates[0], ...coordinates[2]], [500, 500]);

		styleJson.center = pos.center;
		styleJson.zoom = Number.isNaN(pos.zoom) ? 0 : pos.zoom;
		styleJson.layers.push(layerSpec);
		styleJson.sources[tileSourceId as string] = sourceSpec;

		return styleJson;
	}
);
