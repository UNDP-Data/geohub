import { error } from '@sveltejs/kit';
import type { VectorLayerTileStatLayer, VectorTileMetadata } from '$lib/types';
import pkg from 'pmtiles';
const { PMTiles } = pkg;
import arraystat from 'arraystat';
import { mean, std, median } from 'mathjs';
import { attribution, UniqueValueThreshold } from '$lib/config/AppConfig';

/**
 * get metadata json of static pbf
 * @param url pbf path
 * @returns return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)
 */
export const getStaticPbfMetadataJson = async (origin: string, url: string) => {
	const isPmtiles = url.startsWith('pmtiles://');
	if (isPmtiles) {
		const p = new PMTiles(`${url.replace('pmtiles://', '')}`);
		const metadata = await p.getMetadata();
		const header = await p.getHeader();

		const bounds: number[] = [header.minLon, header.minLat, header.maxLon, header.maxLat];

		const data: VectorTileMetadata = {
			name: metadata.name,
			format: metadata.format,
			center: [header.centerLon, header.centerLat, header.centerZoom].join(','),
			bounds: bounds.join(','),
			minzoom: header.minZoom,
			maxzoom: header.maxZoom,
			attribution: metadata.attribution ?? attribution,
			description: metadata.description,
			type: metadata.type,
			version: metadata.version,
			json: {
				vector_layers: metadata.vector_layers,
				tilestats: metadata.tilestats
			}
		};

		data.json.tilestats.layers.forEach((layer) => {
			layer.attributes.forEach((attribute) => {
				if (attribute.type !== 'number') return;
				const values = attribute.values as number[];
				attribute.mean = mean(values);
				attribute.median = median(values);
				attribute.std = std(values);
				if (values.length > UniqueValueThreshold) {
					const histogram = { count: [], bins: [] };
					arraystat(values).histogram.map((item) => {
						histogram.bins.push(item.max), histogram.count.push(item.nb);
					});
					histogram.bins.unshift(Math.min(...values));

					attribute['histogram'] = histogram;
				} else {
					delete attribute.values;
				}
			});
		});

		return data;
	} else {
		//static pbf

		const pbfpath = decodeURI(url);
		const metaURI = pbfpath
			.replace('{z}/{x}/{y}.pbf', 'metadata.json')
			.replace('0/0/0.pbf', 'metadata.json');
		const res = await fetch(metaURI);
		if (!res.ok) {
			error(res.status, { message: res.statusText });
		}
		const data: VectorTileMetadata = await res.json();
		if (data.json) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			data.json = JSON.parse(data.json);
		}

		if (!data.description) {
			data.description = `Vector tile of ${data.name} from UNDP's Azure blob container`;
		}

		if (!data.attribution) {
			data.attribution = attribution;
		}

		const layers = await getStats(origin, pbfpath, data.json.tilestats.layers);
		if (layers.length > 0) {
			data.json.tilestats.layerCount = layers.length;
		} else {
			data.json.tilestats = {
				layerCount: data.json.vector_layers.length,
				layers: data.json.tilestats.layers
			};
		}

		return data;
	}
};

const getStats = async (
	origin: string,
	url: string,
	tileStatsLayers: VectorLayerTileStatLayer[]
) => {
	const pbfPath = url.replace('{z}/{x}/{y}', '0/0/0');

	const layers: VectorLayerTileStatLayer[] = [];

	for (let i = 0; i < tileStatsLayers.length; i++) {
		let tilestatsLayer = tileStatsLayers[i];
		const vectorinfoUrl = `${origin}/api/vector/statistics?path=${pbfPath}&layer_name=${tilestatsLayer.layer}`;
		const res = await fetch(vectorinfoUrl);
		if (res.ok) {
			tilestatsLayer = await res.json();
		}
		layers.push(tilestatsLayer);
	}

	return layers;
};
