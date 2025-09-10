import { Endpoint, error as apiError, type RouteModifier, z } from 'sveltekit-api';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';
import { getStaticPbfMetadataJson } from '$lib/server/helpers/getStaticPbfMetadataJson';
import { error } from '@sveltejs/kit';

export const Output = z
	.custom<VectorTileMetadata>()
	.describe(
		'return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)'
	);

export const Query = z.object({
	pmtiles_path: z
		.string()
		.optional()
		.describe('Pmtiles path. The URL should start with `pmtiles://` prefix')
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
	const pmtiles_path = param.pmtiles_path;
	if (!pmtiles_path) {
		error(400, { message: `'pbfpath' is required.` });
	}
	return await getStaticPbfMetadataJson(url.origin, pmtiles_path);
});
