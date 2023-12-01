import type { RequestHandler } from './$types';
import { createDatasetLinks, getDatasetById } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { env } from '$env/dynamic/private';
import type { DatasetDefaultLayerStyle, VectorLayerTypes, VectorTileMetadata } from '$lib/types';
import { v4 as uuidv4 } from 'uuid';
import type { StyleSpecification } from 'maplibre-gl';
import { MapStyles } from '$lib/config/AppConfig';
import geoViewport from '@mapbox/geo-viewport';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals, url, fetch }) => {
	const session = await locals.getSession();
	const user_email = session?.user.email;
	const id = params.id;

	const is_superuser = session?.user?.is_superuser ?? false;

	let layer_id = url.searchParams.get('layer');
	let layer_type: VectorLayerTypes | 'raster' = url.searchParams.get('type') as
		| VectorLayerTypes
		| 'raster';

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dataset = await getDatasetById(client, id, is_superuser, user_email);
		if (!dataset) {
			return new Response(JSON.stringify({ message: `No dataset found.` }), {
				status: 404
			});
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
			return new Response(JSON.stringify(styleJson));
		}

		if (dataset.properties.is_raster) {
			// raster
			if (!layer_id) {
				layer_id = layer_id ?? '1';
			}
			layer_type = 'raster';
		} else {
			// vector
			dataset.properties = createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);
			const metadataJsonUrl = dataset.properties.links?.find((l) => l.rel === 'metadatajson')?.href;
			const res = await fetch(metadataJsonUrl);
			const metadata: VectorTileMetadata = await res.json();
			if (!layer_id) {
				layer_id = metadata.json.vector_layers[0].id;
			}
			if (!layer_type) {
				const tilestats = metadata.json.tilestats.layers.find((l) => l.layer === layer_id);

				const geomType = tilestats.geometry.toLowerCase();
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
			throw error(res.status, res.statusText);
		}
		const datasetStyle: DatasetDefaultLayerStyle = await res.json();

		const tileSourceId = dataset.properties.id;
		const layerId = uuidv4();

		const layerSpec = JSON.parse(
			JSON.stringify(datasetStyle.style)
				.replace('{source_id}', tileSourceId)
				.replace('{layer_id}', layerId)
		);
		const sourceSpec = JSON.parse(JSON.stringify(datasetStyle.source));

		const coordinates = dataset.geometry.coordinates[0] as [number, number][];
		const pos = geoViewport.viewport([...coordinates[0], ...coordinates[2]], [500, 500]);

		styleJson.center = pos.center;
		styleJson.zoom = pos.zoom;
		styleJson.layers.push(layerSpec);
		styleJson.sources[tileSourceId] = sourceSpec;

		return new Response(JSON.stringify(styleJson));
	} finally {
		dbm.end();
	}
};
