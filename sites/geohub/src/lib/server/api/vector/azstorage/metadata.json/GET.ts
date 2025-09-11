import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';
import { getStaticPbfMetadataJson } from '$lib/server/helpers/getStaticPbfMetadataJson';

import { error } from '@sveltejs/kit';

export const Output = z
	.custom<VectorTileMetadata>()
	.describe(
		'return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)'
	);

export const Query = z.object({
	pbfpath: z.string().optional().describe('pbf path. only available for soruce = azstorage')
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

export default new Endpoint({ Query, Output, Modifier }).handle(async (param, { url }) => {
	const pbfpath = param.pbfpath;
	if (!pbfpath) {
		error(400, { message: `'pbfpath' is required.` });
	}
	const metadatajson: VectorTileMetadata = await getStaticPbfMetadataJson(url.origin, pbfpath);
	return metadatajson;
});
