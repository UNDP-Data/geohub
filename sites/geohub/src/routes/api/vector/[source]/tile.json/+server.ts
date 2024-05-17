import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import type { TileJson } from '$lib/types/TileJson';
import type { VectorTileMetadata } from '$lib/types/VectorTileMetadata';
import { getPgtileservTileJson, generateMetadataJson } from '$lib/server/helpers';

/**
 * /[source]/tile.json?table={tablename}
 * @param params.source source name either pgtileserv
 * @param params.table schemaname and table name (e.g., zambia.poverty)
 * @returns return TileJSON v3.0.0 (https://github.com/mapbox/tilejson-spec/tree/master/3.0.0)
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const source = params.source;
	const table = url.searchParams.get('table');
	const type = url.searchParams.get('type');

	if (!table) {
		return new Response(JSON.stringify({ message: `Missing table parameter` }), {
			status: 400
		});
	}

	if (source === 'pgtileserv' && !['table', 'function'].includes(type)) {
		return new Response(JSON.stringify({ message: `type should be either table or function` }), {
			status: 400
		});
	}

	let tilejson: TileJson;
	let metadatajson: VectorTileMetadata;
	switch (source) {
		case 'pgtileserv':
			tilejson = await getPgtileservTileJson(table, type, env.PGTILESERV_API_ENDPOINT);
			if (tilejson.vector_layers.length === 0) {
				metadatajson = await generateMetadataJson(tilejson);
				tilejson.vector_layers = metadatajson.json.vector_layers;
				tilejson.geometrytype = metadatajson.json.tilestats.layers[0].geometry;
			}
			break;
		default:
			return new Response(JSON.stringify({ message: `Invalid source parameter.` }), {
				status: 400
			});
	}

	return new Response(JSON.stringify(tilejson));
};
