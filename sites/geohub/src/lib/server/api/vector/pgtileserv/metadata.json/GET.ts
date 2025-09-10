import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';
import type { TileJson } from '$lib/types/TileJson';
import { getPgtileservTileJson } from '$lib/server/helpers/getPgtileservTileJson';
import { generateMetadataJson } from '$lib/server/helpers/generateMetadataJson';
import { env } from '$env/dynamic/private';

export const Output = z
	.custom<VectorTileMetadata>()
	.describe(
		'return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)'
	);

export const Query = z.object({
	table: z.string().optional().describe('table name.').openapi({ example: 'zambia.poverty' }),
	type: z
		.enum(['table', 'function'])
		.optional()
		.describe('type name.')
		.openapi({ example: 'table' })
});

export const Error = {
	400: apiError(400, 'Invalid parameter')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Vector tile metadata.json API';
	c.description = 'This api is to generate metadata.json for vector tiles. ';
	c.tags = ['vector tile'];
	return c;
};

export default new Endpoint({ Query, Output, Modifier }).handle(async (param) => {
	const table = param.table;
	const type = param.type;
	const tilejson: TileJson = await getPgtileservTileJson(
		table as string,
		type as string,
		env.PGTILESERV_API_ENDPOINT
	);
	const metadatajson: VectorTileMetadata = await generateMetadataJson(tilejson);
	return metadatajson;
});
