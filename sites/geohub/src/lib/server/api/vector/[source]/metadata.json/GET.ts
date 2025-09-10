import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';
import type { TileJson } from '$lib/types/TileJson';
import { getStaticPbfMetadataJson } from '$lib/server/helpers/getStaticPbfMetadataJson';
import { getPgtileservTileJson } from '$lib/server/helpers/getPgtileservTileJson';
import { generateMetadataJson } from '$lib/server/helpers/generateMetadataJson';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export const Output = z
	.custom<VectorTileMetadata>()
	.describe(
		'return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)'
	);

export const Query = z.object({
	table: z
		.string()
		.optional()
		.describe('table name. only available for source = pgtileserv')
		.openapi({ example: 'zambia.poverty' }),
	pbfpath: z.string().optional().describe('pbf path. only available for soruce = azstorage')
});

export const Param = z.object({
	source: z
		.enum(['azstorage', 'pgtileserv'])
		.describe('source type')
		.openapi({ example: 'pgtileserv' })
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

export default new Endpoint({ Query, Param, Output, Modifier }).handle(async (param, { url }) => {
	const source = param.source;
	const table = param.table;
	// const type = param.type;
	const pbfpath = param.pbfpath;

	let tilejson: TileJson;
	let metadatajson: VectorTileMetadata;
	switch (source) {
		case 'azstorage':
			if (!pbfpath) {
				error(400, { message: `'pbfpath' is required.` });
			}
			metadatajson = await getStaticPbfMetadataJson(url.origin, pbfpath);
			break;
		case 'pgtileserv':
			tilejson = await getPgtileservTileJson(table as string, env.PGTILESERV_API_ENDPOINT);
			metadatajson = await generateMetadataJson(tilejson);
			break;
		default:
			error(400, { message: `Invalid source parameter.` });
	}

	return metadatajson;
});
