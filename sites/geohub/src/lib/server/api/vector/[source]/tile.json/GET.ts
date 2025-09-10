import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';
import type { TileJson } from '$lib/types/TileJson';
import { getPgtileservTileJson } from '$lib/server/helpers/getPgtileservTileJson';
import { generateMetadataJson } from '$lib/server/helpers/generateMetadataJson';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export const Output = z
	.custom<TileJson>()
	.describe('return TileJSON v3.0.0 (https://github.com/mapbox/tilejson-spec/tree/master/3.0.0)');

export const Query = z.object({
	table: z
		.string()
		.describe('table name. only available for source = pgtileserv')
		.openapi({ example: 'zambia.poverty' })
});

export const Param = z.object({
	source: z.enum(['pgtileserv']).describe('source type').openapi({ example: 'pgtileserv' })
});

export const Error = {
	400: apiError(400, 'Invalid parameter')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Vector tile tile.json API';
	c.description = 'This api is to generate tile.json for vector tiles.';
	c.tags = ['vector tile'];
	return c;
};

export default new Endpoint({ Query, Param, Output, Modifier }).handle(async (param) => {
	const source = param.source;
	const table = param.table;

	if (!table) {
		error(400, { message: `Missing table parameter` });
	}

	let tilejson: TileJson;
	let metadatajson: VectorTileMetadata;
	switch (source) {
		case 'pgtileserv':
			tilejson = await getPgtileservTileJson(table, env.PGTILESERV_API_ENDPOINT);
			if (tilejson.vector_layers.length === 0) {
				metadatajson = await generateMetadataJson(tilejson);
				if (metadatajson && metadatajson.json) {
					tilejson.vector_layers = metadatajson.json.vector_layers;
					tilejson.geometrytype = metadatajson.json.tilestats?.layers[0].geometry;
				}
			}
			break;
		default:
			error(400, { message: `Invalid source parameter.` });
	}

	return tilejson;
});
