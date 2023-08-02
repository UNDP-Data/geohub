import type { TileJson } from '$lib/types/TileJson';
import type { VectorLayerTileStatLayer } from '$lib/types/VectorLayerTileStatLayer';
import type { VectorTileMetadata } from '$lib/types/VectorTileMetadata';
import { fetchVectorTileInfo } from '$lib/server/helpers/fetchVectorInfo';

/**
 * generate metadata.json from tilejson
 * @param tilejson TileJSON object
 * @param origin URL origin
 * @returns return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md
 */
export const generateMetadataJson = async (tilejson: TileJson) => {
	const pbfPath = tilejson.tiles[0].replace('{z}/{x}/{y}', '0/0/0');
	const tilestatsLayer: VectorLayerTileStatLayer = await fetchVectorTileInfo(
		pbfPath,
		tilejson.name
	);

	const data: VectorTileMetadata = {
		name: tilejson.name,
		version: '1.3.0',
		type: 'overlay',
		description: tilejson.description,
		attribution: tilejson.attribution,
		format: 'pbf',
		center: '0,0,0',
		bounds: '-180,-90,180,90',
		minzoom: tilejson.minzoom,
		maxzoom: tilejson.maxzoom,
		json: {
			vector_layers: tilejson.vector_layers,
			tilestats: {
				layerCount: 1,
				layers: [tilestatsLayer]
			}
		}
	};

	if (data.json.vector_layers.length === 0) {
		data.json.tilestats?.layers.forEach((layer) => {
			const id = layer.layer;
			const fields: { [key: string]: string } = {};
			layer.attributes.forEach((attr) => {
				fields[attr.attribute] = attr.attribute;
			});
			data.json.vector_layers.push({ id: id, fields: fields });
		});
	}

	data.json.vector_layers?.forEach((v) => {
		const statLayer = data.json.tilestats?.layers.find((l) => l.layer === v.id);
		const attributes = statLayer.attributes.map((a) => a.attribute);
		for (const field of Object.keys(v.fields)) {
			if (!attributes.includes(field)) {
				delete v.fields[field];
			}
		}
	});

	if (tilejson.bounds) {
		data.center = `${(tilejson.bounds[0] + tilejson.bounds[2]) / 2},${
			(tilejson.bounds[1] + tilejson.bounds[3]) / 2
		},${tilejson.minzoom}`;
		data.bounds = `${tilejson.bounds[0]},${tilejson.bounds[1]},${tilejson.bounds[2]},${tilejson.bounds[3]}`;
	}
	return data;
};
