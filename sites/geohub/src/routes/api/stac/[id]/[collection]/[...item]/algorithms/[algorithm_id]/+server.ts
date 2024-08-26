import type { RequestHandler } from '@sveltejs/kit';
import { createDatasetLinks } from '$lib/server/helpers';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, url, params }) => {
	const feature = await request.json();
	const tool = params.algorithm_id;
	feature.properties.tags = feature.properties.tags.filter(
		(t: { key: string }) => t.key !== 'algorithm'
	);
	feature.properties.tags = [...feature.properties.tags, { key: 'algorithm', value: tool }];
	feature.properties = await createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);
	return new Response(JSON.stringify(feature));
};
